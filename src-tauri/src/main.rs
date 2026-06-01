#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_autostart::MacosLauncher;
use std::fs;

#[cfg(target_os = "windows")]
fn set_always_on_bottom(hwnd: isize) {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{
        GetWindowLongW, SetWindowLongW, SetWindowPos,
        GWL_EXSTYLE, HWND_BOTTOM,
        SWP_NOMOVE, SWP_NOSIZE, SWP_NOACTIVATE,
        WS_EX_TOOLWINDOW, WS_EX_NOACTIVATE,
    };
    unsafe {
        let h = HWND(hwnd as *mut _);
        let ex_style = GetWindowLongW(h, GWL_EXSTYLE);
        SetWindowLongW(
            h, GWL_EXSTYLE,
            ex_style | WS_EX_TOOLWINDOW.0 as i32 | WS_EX_NOACTIVATE.0 as i32,
        );
        SetWindowPos(h, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE).ok();
    }
}

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
    app.exit(0);
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .setup(|app| {
          let window = app.get_webview_window("main").unwrap();
          window.set_decorations(false)?;
          window.set_shadow(false)?;

          #[cfg(target_os = "windows")]
          {
              let hwnd = window.hwnd().unwrap().0 as isize;
            //   set_always_on_bottom(hwnd);
          }

          // Menu do tray
          let show = MenuItem::with_id(app, "show", "Mostrar", true, None::<&str>)?;
          let hide = MenuItem::with_id(app, "hide", "Ocultar", true, None::<&str>)?;
          let quit = MenuItem::with_id(app, "quit", "Fechar", true, None::<&str>)?;
          let menu = Menu::with_items(app, &[&show, &hide, &quit])?;

          // Ícone do tray — usa o ícone padrão do bundle
          TrayIconBuilder::new()
          .icon(app.default_window_icon().unwrap().clone())
          .menu(&menu)
          .tooltip("Calendar Widget")
          .on_menu_event(|app, event| match event.id.as_ref() {
              "show" => {
                  if let Some(w) = app.get_webview_window("main") {
                      w.show().unwrap();
                      #[cfg(target_os = "windows")]
                      {
                          let hwnd = w.hwnd().unwrap().0 as isize;
                          //set_always_on_bottom(hwnd);
                      }
                  }
              }
              "hide" => {
                  if let Some(w) = app.get_webview_window("main") {
                      w.hide().unwrap();
                  }
              }
              "quit" => app.exit(0),
              _ => {}
          })
          .on_tray_icon_event(|tray, event| {
              // Clique esquerdo no ícone alterna visibilidade
              if let TrayIconEvent::Click {
                  button: MouseButton::Left,
                  button_state: MouseButtonState::Up,
                  ..
              } = event {
                  let app = tray.app_handle();
                  if let Some(w) = app.get_webview_window("main") {
                      if w.is_visible().unwrap_or(false) {
                          w.hide().unwrap();
                      } else {
                          w.show().unwrap();
                          #[cfg(target_os = "windows")]
                          {
                              let hwnd = w.hwnd().unwrap().0 as isize;
                              //set_always_on_bottom(hwnd);
                          }
                      }
                  }
              }
          })
          .build(app)?;

          let config_path = app.path().app_data_dir().unwrap().join("position.json");

          // Restaura posição salva
          if let Ok(content) = fs::read_to_string(&config_path) {
              if let Ok(pos) = serde_json::from_str::<serde_json::Value>(&content) {
                  let x = pos["x"].as_i64().unwrap_or(40) as i32;
                  let y = pos["y"].as_i64().unwrap_or(40) as i32;
                  window.set_position(tauri::Position::Physical(
                      tauri::PhysicalPosition { x, y }
                  ))?;
              }
          }

          // Salva posição ao mover
          let config_path_clone = config_path.clone();
          window.on_window_event(move |event| {
              if let tauri::WindowEvent::Moved(pos) = event {
                  let json = serde_json::json!({ "x": pos.x, "y": pos.y });
                  let _ = fs::write(&config_path_clone, json.to_string());
              }
          });
            
          Ok(())
        })
        .invoke_handler(tauri::generate_handler![close_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}