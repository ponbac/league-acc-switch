// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use specta::collect_types;
use tauri_specta::ts;

mod commands;

fn main() {
    #[cfg(debug_assertions)]
    ts::export(
        collect_types![commands::login, commands::check_exec],
        "../src/bindings.ts",
    )
    .unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::login,
            commands::check_exec
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
