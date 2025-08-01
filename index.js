require('dotenv').config(); // 🔐 Load .env

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytSearch = require('yt-search');
const ytdlp = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');

const app = express();
app.get('/', (req, res) => res.send('KushMusicBot is alive!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;

client.once('ready', () => {
  console.log(`🎵 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!play') || message.author.bot) return;

  const args = message.content.split(' ');
  const query = args.slice(1).join(' ');
  if (!query) return message.reply("Please provide a song name or YouTube URL.");

  console.log("🔍 Received play command for query:", query);

  let url = query;
  if (!query.startsWith('http')) {
    const searchResult = await ytSearch(query);
    if (!searchResult.videos || searchResult.videos.length === 0) {
      return message.reply("❌ No results found.");
    }
    url = searchResult.videos[0].url;
    console.log("🔗 Top YouTube result:", url);
  }

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.reply('Join a voice channel first!');

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  const outputPath = path.resolve(__dirname, 'current.mp3');

  try {
    await ytdlp(url, {
      output: outputPath,
      extractAudio: true,
      audioFormat: 'mp3',
    });

    console.log("🎧 Download complete, creating audio resource...");

    const resource = createAudioResource(outputPath);
    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    message.reply(`🎶 Now playing: ${url}`);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error("❌ Error downloading or playing audio:", err);
    message.reply("There was an error playing the song.");
    connection.destroy();
  }
});

client.login(TOKEN);
