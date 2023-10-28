// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use specta::collect_types;
use sysinfo::{ProcessExt, SystemExt};
use tauri_specta::ts;

mod commands;

fn main() {
    #[cfg(debug_assertions)]
    ts::export(collect_types![commands::hello], "../src/bindings.ts").unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![commands::hello,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn league_processes() -> Vec<(String, String)> {
    let mut processes = Vec::new();

    let sys = sysinfo::System::new_all();
    for (pid, process) in sys.processes() {
        let lowercase_name = process.name().to_lowercase();
        if lowercase_name.contains("riot") || lowercase_name.contains("league") {
            processes.push((pid.to_string(), process.name().to_string()));
        }
    }

    processes
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_processes() {
        let processes = league_processes();

        for process in &processes {
            println!("{}: {}", process.0, process.1);
        }

        assert!(!processes.is_empty());
    }
}
