#[tauri::command]
fn read_schema(filename: String) -> Result<String, String> {
  // 读取 exe 同目录下的 samples/ 文件夹，算法人员可直接修改
  if let Ok(exe_path) = std::env::current_exe() {
    if let Some(exe_dir) = exe_path.parent() {
      let path = exe_dir.join("samples").join(&filename);
      if let Ok(content) = std::fs::read_to_string(&path) {
        return Ok(content);
      }
    }
  }
  Err(format!("Schema file '{}' not found next to the executable", filename))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![read_schema])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
