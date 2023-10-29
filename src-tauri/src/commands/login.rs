use std::{mem::forget, process::Command};

use enigo::KeyboardControllable;
use sysinfo::{ProcessExt, SystemExt};

#[tauri::command]
#[specta::specta]
pub fn login(username: String, password: String) -> Result<(), String> {
    kill_league_processes();
    start_league();
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

fn start_league() {
    let child = Command::new("C:\\Riot Games\\Riot Client\\RiotClientServices.exe")
        .arg("--launch-product=league_of_legends")
        .arg("--launch-patchline=live")
        .spawn()
        .expect("Failed to start program");

    forget(child);
}

fn enter_credentials(username: String, password: String) {
    // sleep for 5 secs
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
