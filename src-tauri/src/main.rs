// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, fs, path::Path};

#[tauri::command]
fn start_with_file() -> String {
  let mut result = String::from("");
  let args: Vec<String> = env::args().collect();
  if args.len() == 2 {
    result = fs::read_to_string(Path::new(&args[1])).expect("read error");
  }
  result
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![start_with_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
