#[tauri::command]
#[specta::specta]
pub fn hello(name: String) -> String {
    format!("Hello, {}!", name)
}
