use std::{mem::forget, process::Command, thread::sleep};

use clipboard_win::{formats, set_clipboard};
use enigo::KeyboardControllable;
use sysinfo::{ProcessRefreshKind, RefreshKind};

#[tauri::command]
#[specta::specta]
pub async fn login(
    username: String,
    password: String,
    client_exec_path: String,
) -> Result<(), String> {
    kill_league_processes();
    start_league(&client_exec_path)?;
    enter_credentials(username, password);

    Ok(())
}

fn kill_league_processes() {
    let sys = sysinfo::System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new()),
    );

    for (pid, process) in sys.processes() {
        let lowercase_name = process.name().to_string_lossy().to_lowercase();
        if lowercase_name.contains("riot") || lowercase_name.contains("league") {
            println!("Killing [{}]: {}", pid, process.name().to_string_lossy());
            process.kill();
        }
    }
}

fn start_league(exec_path: &str) -> Result<(), String> {
    let child = Command::new(exec_path)
        .arg("--launch-product=league_of_legends")
        .arg("--launch-patchline=live")
        .spawn()
        .map_err(|e| {
            let error_msg = format!("Failed to start League: {}", e);
            eprintln!("{}", error_msg);

            error_msg
        })?;

    forget(child);
    Ok(())
}

fn enter_credentials(username: String, password: String) {
    wait_for_process_to_appear("Riot Client.exe");
    std::thread::sleep(std::time::Duration::from_millis(6000));

    let mut enigo = enigo::Enigo::new();
    set_clipboard_and_paste(&username, &mut enigo);
    enigo.key_sequence_parse("{TAB}");
    set_clipboard_and_paste(&password, &mut enigo);
    enigo.key_sequence_parse("{RETURN}");
    set_clipboard(formats::Unicode, "").expect("To set clipboard");
}

fn wait_for_process_to_appear(process_name: &str) {
    let mut sys = sysinfo::System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new()),
    );

    while !sys.processes().iter().any(|(_, process)| {
        process.name().to_string_lossy().to_lowercase() == process_name.to_lowercase()
    }) {
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
        std::thread::sleep(std::time::Duration::from_millis(50));
    }

    println!("Process {} appeared", process_name);
}

fn set_clipboard_and_paste(text: &str, enigo: &mut enigo::Enigo) {
    set_clipboard(formats::Unicode, text).expect("To set clipboard");
    sleep(std::time::Duration::from_millis(200));
    enigo.key_down(enigo::Key::Control);
    enigo.key_click(enigo::Key::Layout('v'));
    enigo.key_up(enigo::Key::Control);
    sleep(std::time::Duration::from_millis(200));
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_kill_processes() {
//         let kill_result = kill_league_processes();

//         assert!(kill_result.is_ok());
//     }

//     #[test]
//     fn test_start_league() {
//         let start_result = start_league();
//         enter_credentials().unwrap();

//         assert!(start_result.is_ok());
//     }
// }
