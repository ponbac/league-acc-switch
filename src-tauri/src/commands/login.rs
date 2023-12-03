use std::{mem::forget, process::Command};

use enigo::KeyboardControllable;
use sysinfo::{ProcessExt, ProcessRefreshKind, RefreshKind, SystemExt};

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
    wait_for_process_to_appear("RiotClientUx.exe");
    std::thread::sleep(std::time::Duration::from_millis(5000));

    let mut enigo = enigo::Enigo::new();
    enigo.key_sequence(&username.to_lowercase());
    enigo.key_sequence_parse("{TAB}");
    enigo.key_sequence(&password);
    enigo.key_sequence_parse("{RETURN}");
}

fn wait_for_process_to_appear(process_name: &str) {
    let mut sys = sysinfo::System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new()),
    );

    while !sys
        .processes()
        .iter()
        .any(|(_, process)| process.name().to_lowercase() == process_name.to_lowercase())
    {
        sys.refresh_processes();
        std::thread::sleep(std::time::Duration::from_millis(50));
    }

    println!("Process {} appeared", process_name);
}

#[cfg(test)]
mod tests {
    use std::{thread::sleep, time::Duration};

    use enigo::{Enigo, MouseControllable};
    use find_subimage::{Image, SubImageFinderState};
    use screenshots::Screen;

    use super::*;

    #[test]
    fn test_get_pixel() {
        let screen = Screen::from_point(100, 100).unwrap();
        println!("capturer {screen:?}");
        let image_1 = screen.capture_area(100, 100, 100, 100).unwrap();
        image_1.save("test.png").unwrap();
        let raw_image_1 = image_1.as_raw();
        let image_2 = screen.capture_area(100, 200, 100, 100).unwrap();
        image_2.save("test2.png").unwrap();
        let raw_image_2 = image_2.as_raw();
        let big_image = screen.capture_area(100, 100, 200, 200).unwrap();
        big_image.save("test3.png").unwrap();
        let raw_big_image = big_image.as_raw();

        // time it
        let start = std::time::Instant::now();
        let mut finder = SubImageFinderState::new();

        let big_size: usize = 200;
        let small_size: usize = 100;
        let positions: &[(usize, usize, f32)] = finder.find_subimage_positions(
            (raw_big_image, big_size, big_size),
            (raw_image_1, small_size, small_size),
            4,
        );
        let max: Option<&(usize, usize, f32)> = positions
            .iter()
            .min_by(|(_, _, dist), (_, _, dist2)| dist.partial_cmp(dist2).unwrap());
        println!("The subimage was found at position {:?}", &max);
        println!("Time taken: {} ms", start.elapsed().as_millis());

        // https://crates.io/crates/find-subimage
    }
}
