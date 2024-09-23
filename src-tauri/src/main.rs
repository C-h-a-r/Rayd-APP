// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use serenity::client::Client;
use serenity::prelude::*;
use serenity::model::gateway::Ready;
use serenity::async_trait;
use serenity::model::gateway::GatewayIntents; // Import GatewayIntents
use std::sync::{Arc, Mutex}; // Use Mutex for shared state
use std::thread;

#[derive(Clone)]
struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tauri::command]
async fn login(token: String) -> Result<String, String> {
    // Specify the intents your bot will need
    let intents = GatewayIntents::GUILD_MESSAGES
    | GatewayIntents::DIRECT_MESSAGES
    | GatewayIntents::MESSAGE_CONTENT;

    // Try to create the client
    let client = Client::builder(&token, intents)
        .event_handler(Handler)
        .await.map_err(|why| format!("Client creation failed: {:?}", why))?;

    // Start the bot in a new thread to keep the function responsive
    let client_arc = Arc::new(Mutex::new(client));
    let client_clone = Arc::clone(&client_arc);

    thread::spawn(move || {
        // Run the client
        let _ = futures::executor::block_on(client_clone.lock().unwrap().start());
    });

    Ok("Successfully logged in!".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
