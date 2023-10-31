use std::{mem::forget, process::Command};

use enigo::KeyboardControllable;
use sysinfo::{ProcessExt, SystemExt};

#[tauri::command]
#[specta::specta]
pub fn login(username: String, password: String, client_exec_path: String) -> Result<(), String> {
    kill_league_processes();
    start_league(&client_exec_path)?;
    enter_credentials(username, password);

    Ok(())
}

fn kill_league_processes() {
    let sys = sysinfo::System::new_all();
    for (pid, process) in sys.processes() {
        let lowercase_name = process.name().to_lowercase();
        if lowercase_name.contains("riot") || lowercase_name.contains("league") {
            println!("Killing [{}]: {}", pid, process.name());
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
    // sleep for 10 secs
    std::thread::sleep(std::time::Duration::from_secs(10));
    let mut enigo = enigo::Enigo::new();

    enigo.key_sequence(&username.to_lowercase());
    enigo.key_sequence_parse("{TAB}");
    enigo.key_sequence(&password);
    enigo.key_sequence_parse("{RETURN}");
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
