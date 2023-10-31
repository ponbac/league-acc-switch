use std::path::Path;

#[tauri::command]
#[specta::specta]
pub fn check_exec(client_exec_path: String) -> bool {
    let exec_path = Path::new(&client_exec_path);

    exec_path.exists()
}
