const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType,
    jidDecode
} = require('@adiwajshing/baileys')
const yts = require( 'yt-search' )
const { sms } = require('./lib/message');
const { imageToWebp, videoToWebp, writeExif } = require('./lib/stic')
const ffmpeg = require('fluent-ffmpeg');
const xa = require('xfarr-api')
const { mediafire } = require('./lib/mediafire.js')
const fetch = require('node-fetch')

const fs = require('fs')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const util = require('util')
const config = require('./config')
const axios = require('axios')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('./lib/functions')
const { state, saveState } = useSingleFileAuthState('./session.json')

const prefix = '.'
const owner = ['94766866297']

const connectToWA = () => {
	const conn = makeWASocket({
		logger: P({ level: 'silent' }),
		printQRInTerminal: true,
		auth: state,
	})
	
	conn.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update
		if (connection === 'close') {
			if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
				connectToWA()
			}
		} else if (connection === 'open') {
			console.log('Bot conectado')
		}
	})
	
	conn.ev.on('creds.update', saveState)
	
	conn.ev.on('messages.upsert', async(mek) => {
		try {
			mek = mek.messages[0]
			if (!mek.message) return
			
			mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
			if (mek.key && mek.key.remoteJid === 'status@broadcast') return
			const type = getContentType(mek.message)
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			
			const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
			const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : ( type == 'listResponseMessage') && mek.message.listResponseMessage.singleSelectReply.selectedRowId? mek.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'buttonsResponseMessage') && mek.message.buttonsResponseMessage.selectedButtonId  ? mek.message.buttonsResponseMessage.selectedButtonId  : (type == "templateButtonReplyMessage") && mek.message.templateButtonReplyMessage.selectedId ? mek.message.templateButtonReplyMessage.selectedId  :  (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
			
			const isCmd = body.startsWith(prefix)
			const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
			
			const args = body.trim().split(/ +/).slice(1)
			const q = args.join(' ')
			const isGroup = from.endsWith('@g.us')
			const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
			const senderNumber = sender.split('@')[0]
			const botNumber = conn.user.id.split(':')[0]
			const pushname = mek.pushName || 'Sin Nombre'
			
			const isMe = botNumber.includes(senderNumber)
			const isOwner = owner.includes(senderNumber) || isMe
			
			const reply = (teks) => {
				conn.sendMessage(from, { text: teks }, { quoted: mek })
			}
            const groupMetadata = mek.isGroup ? await conn.groupMetadata(mek.chat).catch(e => {}) : ''
            const groupName = mek.isGroup ? groupMetadata.subject : ''
            const participants = mek.isGroup ? await groupMetadata.participants : ''
            const groupAdmins = mek.isGroup ? await participants.filter(v => v.admin !== null).map(v => v.id) : ''
            const groupOwner = mek.isGroup ? groupMetadata.owner : ''
    	    const isBotAdmins = mek.isGroup ? groupAdmins.includes(botNumber) : false
    	    const isAdmins = mek.isGroup ? groupAdmins.includes(mek.sender) : false

            if (!isOwner && body.includes('chat.whatsapp.com')) {
                await conn.sendMessage(from, { delete: mek.key })
            }       
			if (!isGroup && !isOwner) {
               return reply ('Inbox Not Allowed')
                
            }
        
			switch (command) {

//.......................................................Alive..............................................................\\

case 'alive': {
 conn.sendMessage(from, { react: { text: '👋', key: mek.key }})
 
let alivemsg = `Hello ${pushname} 

I Am Alive Now

Whatsapp Group : 
https://chat.whatsapp.com/KmE7YzrrQBk124CrpI8PCd`
let buttons = [
{buttonId: prefix + 'owner ', buttonText: {displayText: 'OWNER'}, type: 1},
{buttonId: prefix + 'menu ', buttonText: {displayText: 'MENU'}, type: 1}
]
let buttonMessage = {
image: {url: config.ALIVE_LOGO},
caption: alivemsg,
footer: config.FOOTER,
buttons: buttons,
headerType: 4,
}
conn.sendMessage(from, buttonMessage, { quoted: mek })
}
break

//.......................................................Alive..............................................................\\

case 'owner' :
		const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n' 
            + `FN:` + 'Buddhika' + `\n` // full name
            + 'TEL;type=CELL;type=VOICE;waid=' + '94766866297' + ':+' + '94766866297' + '\n' // WhatsApp ID + phone number
            + 'END:VCARD'
 await conn.sendMessage(from,{ contacts: { displayName: 'noureddine_ouafy' , contacts: [{ vcard }]  }} , { quoted: mek })      
		      break 

//.......................................................Menu..............................................................\\

case 'menu' :
let menumsg = `◉═════════════◉
  🐉CyberX Commands🐉
◉═════════════◉

┌─(📥ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ᴄᴏᴍᴍᴀɴᴅꜱ)
│.song
│.video
│.yt
│.ytdl
│.fb
│.mediafire 
│.img
│.tiktok
│.apk
└─────────◉
┌─(🔍ꜱᴇᴀʀᴄʜ ᴄᴏᴍᴍᴀɴᴅꜱ)
│.yts
└─────────◉
┌─(🧰ᴄᴏɴᴠᴇʀᴛ ᴄᴏᴍᴍᴀɴᴅꜱ)
│.sticker
│.logo
└─────────◉
┌─(💫ᴏᴛʜᴇʀ ᴄᴏᴍᴍᴀɴᴅꜱ)
│.alive
└─────────◉`
reply(menumsg)
break

//.......................................................Youtube..............................................................\\

case 'yts': case 'getyt': 
try {
    
    conn.sendMessage(from, { react: { text: '🔍', key: mek.key }})
       if (!q) return reply('Example : ' + prefix + command + ' Chanux bro')
    var arama = await yts(q)
    var msg = '';
   arama.all.map((video) => {
   msg += ' *🖲️' + video.title + '*\n🔗 ' + video.url + '\n\n'
   });
   const results = await conn.sendMessage(from , { text:  msg }, { quoted: mek } )
   } catch(e) {
    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
   }
    break	
               
 case 'play': case 'yt': 
                   
                   try {
               
                    conn.sendMessage(from, { react: { text: '🔍', key: mek.key }})
                    if (!q) return reply('Example : ' + prefix + command + ' lelena')
                let yts = require("yt-search")
                var svid = q.replace("shorts/","watch?v=")
                var s2vid = svid.replace("?feature=share","")
                let search = await yts(s2vid)
                let anu = search.videos[0]
   let buttons = [
   {buttonId: prefix + 'ytmp4 ' +  anu.url + ' 360p', buttonText: {displayText: 'VIDEO'}, type: 1},
   {buttonId: '.ytmp3 ' + anu.url + ' 128kbps', buttonText: {displayText: 'AUDIO'}, type: 1}
   ]
   let buttonMessage = {
   image: { url: anu.thumbnail },
   caption: '┌───[🐉CyberX🐉]\n\n  *📥YOUTUBE DOWNLODER*\n\n│🧚🏻‍♀️ᴛɪᴛʟᴇ: ' + anu.title + '\n\n│ 👀ᴠɪᴇᴡs: ' + anu.views + '\n\n│ 📹 ᴄʜᴀɴɴᴇʟ: ' + anu.author + '\n\n│🖇️ᴜʀʟ: ' + anu.url + '\n\n└───────────◉',
   footer: 'sᴇʟᴇᴄᴛ ꜰᴏʀᴍᴀᴛ:',
   buttons: buttons,
   headerType: 4,
   }
   conn.sendMessage(from, buttonMessage, { quoted: mek })
} catch(e) {
    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
   }

   break
                       case 'song':  
                       try {
                        conn.sendMessage(from, { react: { text: '🎧', key: mek.key }})
                        if (!q) return reply('Example : ' + prefix + command + ' lelena')
                    let yts = require("yt-search")
                    var svid = q.replace("shorts/","watch?v=")
                    var s2vid = svid.replace("?feature=share","")
                    let search = await yts(s2vid)
                    let anu = search.videos[0]
                        
   let buttons = [
   {buttonId: prefix + 'ytdoc ' +  anu.url , buttonText: {displayText: 'DOCUMENT'}, type: 1},
   {buttonId: prefix + 'ytmp3 ' + anu.url , buttonText: {displayText: 'AUDIO'}, type: 1}
   ]
   let buttonMessage = {
   image: { url: anu.thumbnail },
   caption: '┌───[🐉CyberX🐉]\n\n  *📥SONG DOWNLODER*\n\n│🎧sᴏɴɢ: ' + anu.title + '\n\n│ 👀ᴠɪᴇᴡs: ' + anu.views + '\n\n│ 📹 ᴄʜᴀɴɴᴇʟ: ' + anu.author + '\n\n│🖇️ᴜʀʟ: ' + anu.url + '\n\n└───────────◉',
   footer: 'sᴇʟᴇᴄᴛ ꜰᴏʀᴍᴀᴛ:',
   buttons: buttons,
   headerType: 4,
   }
   conn.sendMessage(from, buttonMessage, { quoted: mek })
   } catch(e) {
    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
   }

   break
                       
                       
                       case 'video': 
                       try {
               
       conn.sendMessage(from, { react: { text: '📽️', key: mek.key }})
       if (!q) return reply('Example : ' + prefix + command + ' lelena')
   let yts = require("yt-search")
   var svid = q.replace("shorts/","watch?v=")
   var s2vid = svid.replace("?feature=share","")
   let search = await yts(s2vid)
   let anu = search.videos[0]
   let buttons = [
   {buttonId: prefix + 'ytmp4 ' +  anu.url + '360p', buttonText: {displayText: '360p'}, type: 1},
   {buttonId: prefix + 'ytmp4 ' + anu.url + '480p', buttonText: {displayText: '480p'}, type: 1},
   {buttonId: prefix + 'ytmp4 ' + anu.url + '720p', buttonText: {displayText: '720p'}, type: 1}
   ]
   let buttonMessage = {
   image: { url: anu.thumbnail },
   caption: '┌───[🐉CyberX🐉]\n\n  *📥YT VIDEO DOWNLODER*\n\n│📽️ᴠɪᴅᴇᴏ: ' + anu.title + '\n\n│ 👀ᴠɪᴇᴡs: ' + anu.views + '\n\n│ 📹 ᴄʜᴀɴɴᴇʟ: ' + anu.author + '\n\n│🖇️ᴜʀʟ: ' + anu.url + '\n\n└───────────◉',
   footer: 'sᴇʟᴇᴄᴛ Qᴜᴀʟɪᴛʏ:',
   buttons: buttons,
   headerType: 4,
   }
   conn.sendMessage(from, buttonMessage, { quoted: mek })
} catch(e) {
    await conn.sendMessage(from , { text: 'error' }, { quoted: mek } ) 
   }
   break
                       
                       case 'ytdl': 
                       try {
                        conn.sendMessage(from, { react: { text: '🔍', key: mek.key }})
                        if (!q) return reply('Example : ' + prefix + command + ' lelena')
                    let yts = require("yt-search")
                    var svid = q.replace("shorts/","watch?v=")
                    var s2vid = svid.replace("?feature=share","")
                    let search = await yts(s2vid)
                    let anu = search.videos[0]
                          
   const listMessage = {
         text: '┌───[🐉CyberX🐉]\n\n  *📥ADVANCE DOWNLODER*\n\n│🧚ᴛɪᴛʟᴇ: ' + anu.title + '\n\n│ 👀ᴠɪᴇᴡs: ' + anu.views + '\n\n│ 📹 ᴄʜᴀɴɴᴇʟ: ' + anu.author + '\n\n│🖇️ᴜʀʟ: ' + anu.url + '\n\n└───────────◉',
         footer: config.FOOTER,
         title: 'Hello ' + pushname ,
         buttonText: "Results",
         sections: [{
                                   "title": "Advance Video Quality",
                                   "rows": [
                                       {
                                           "title": "1080p",
                                           "description": "",
                                           "rowId": prefix + 'ytmp4 ' + anu.url + ' 1080p'
                                       },
   
                                                                           {
                                           "title": "720p",
                                           "description": "",
                                           "rowId": prefix + 'ytmp4 ' + anu.url + ' 720p'
                                       },
                                                                           {
                                           "title": "480p",
                                           "description": "",
                                           "rowId": prefix + 'ytmp4 ' + anu.url + ' 480p'
                                       },
                                                                           {
                                           "title": "360p",
                                           "description": "",
                                           "rowId": prefix + 'ytmp4 ' + anu.url + ' 360p'
                                       },
                                                                           {
                                           "title": "240p",
                                           "description": "",
                                           "rowId": prefix + 'ytmp4 ' + anu.url + ' 240p'
                                       },
                                                   {
                                           "title": "144p",
                                           "description": "",
                                           "rowId": prefix + 'ytmp4 ' + anu.url + ' 144p'
                                       }
                                   ]
                               },
                               {
                                   "title": "Advance Mp3 Audio",
                                   "rows": [
                                       {
                                           "title": "High",
                                           "description": "",
                                           "rowId": prefix + 'ytmp3 ' + anu.url + ' 320kbps'
                                       },
                                       {
                                           "title": "Medium",
                                           "description": "",
                                           "rowId": prefix + 'ytmp3 ' + anu.url + ' 256kbps'
                                           },
                                       {
                                           "title": "Low",
                                           "description": "",
                                           "rowId": prefix + 'ytmp3 ' + anu.url + ' 128kbps'
                                           }
                                           
                                   ]
                               },
                               {
                                   "title": "Advance Mp3 Document",
                                   "rows": [
                                       {
                                           "title": "High",
                                           "description": "",
                                           "rowId": prefix + 'ytdoc ' + anu.url + ' 320kbps'
                                       },
                                       {
                                           "title": "Medium",
                                           "description": "",
                                           "rowId": prefix + 'ytdoc ' + anu.url + ' 256kbps'
                                           },
                                       {
                                           "title": "Low",
                                           "description": "",
                                           "rowId": prefix + 'ytdoc ' + anu.url + ' 128kbps'
                                           }
                                   ]
                               }
                               
                           ]
     }
               await conn.sendMessage(from, listMessage, {quoted: mek })
            } catch(e) {
                await conn.sendMessage(from , { text: 'error' }, { quoted: mek } ) 
               }
               break
   
               case 'ytmp3': 
               try {
                await conn.sendMessage(from, { react: { text: '🎧', key: mek.key }})
                if ( !q.includes('youtu') ) return await conn.sendMessage(from , { text: '*Need yt link*' }, { quoted: mek } )  
                          let { yta } = require('./lib/y2mate')
                                  let quality = args[1] ? args[1] : '128kbps'
                                  let media = await yta(q, quality)
                const auddown = await conn.sendMessage(from , { text: config.SONG_DOWN }, { quoted: mek } )
                await conn.sendMessage(from, { delete: auddown.key })
                const audup = await conn.sendMessage(from , { text: config.SONG_UP }, { quoted: mek } )
                const au = await conn.sendMessage(from, { audio: { url: media.dl_link }, mimetype: 'audio/mpeg', fileName: media.title + '.mp3' }, { quoted: mek })
                await conn.sendMessage(from, { delete: audup.key })
                
            } catch(e) {
                await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
               }
                              break

                              case 'ytdoc': 
                              try {
                                await conn.sendMessage(from, { react: { text: '🎧', key: mek.key }})
                                if ( !q.includes('youtu') ) return await conn.sendMessage(from , { text: '*Need yt link*' }, { quoted: mek } )  
                                          let { yta } = require('./lib/y2mate')
                                                  let quality = args[1] ? args[1] : '128kbps'
                                                  let media = await yta(q, quality)
                                                  const docdown = await conn.sendMessage(from , { text: config.SONG_DOWN }, { quoted: mek } )
                                                  await conn.sendMessage(from, { delete: docdown.key })
                                                  const docup = await conn.sendMessage(from , { text: config.SONG_UP }, { quoted: mek } )
                                                  const doc = await conn.sendMessage(from, { document: { url: media.dl_link }, mimetype: 'audio/mpeg', fileName: media.title + '.mp3' }, { quoted: mek })
                                                  await conn.sendMessage(from, { delete: docup.key })
                            } catch(e) {
                                await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
                               }
                                                 break
                       
                       case 'ytmp4': 
                       try {
                       await conn.sendMessage(from, { react: { text: '📽️', key: mek.key }})
                       if ( !q.includes('youtu') ) return await conn.sendMessage(from , { text: '*Need yt link*' }, { quoted: mek } )  
                                  let { ytv } = require('./lib/y2mate')
                                         let quality = args[1] ? args[1] : '360p'
                                         let media = await ytv(q, quality)
                                         if (media.filesize >= 100000) {
                                         const msg = '*VIDEO SIZE UP TO 100MB ⛔*'
                                         const templateButtons = [
                                           { urlButton: {displayText: 'ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ 🎯' , url: media.dl_link + '.mp4' }},
                                         ]
                   
                                         const templateMessage = {
                                         text: msg,
                                         footer: config.FOOTER,
                                         templateButtons: templateButtons
                                         }
                   
                                         await conn.sendMessage(from, templateMessage, { quoted: mek })   
                                       }
                    
                       const viddown = await conn.sendMessage(from , { text: config.VIDEO_DOWN }, { quoted: mek } )
                       await conn.sendMessage(from, { delete: viddown.key })
                       const vidup = await conn.sendMessage(from , { text: config.VIDEO_UP }, { quoted: mek } )
                       const vid = await conn.sendMessage(from, { video: { url: media.dl_link }, mimetype: 'video/mp4', fileName: media.title + '.mp4', caption: config.CAPTION }, { quoted: mek })
                       await conn.sendMessage(from, { delete: vidup.key })
                    } catch(e) {
                        await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
                       }
                                     break

//.......................................................Sticker..............................................................\\

case 'sticker' :
          await conn.sendMessage(from, { react: { text: '🪄', key: mek.key }})
          const v = sms(conn , mek)
          const isQuotedViewOnce = v.quoted ? (v.quoted.type === 'viewOnceMessage') : false
	        const isQuotedImage = v.quoted ? ((v.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'imageMessage') : false)) : false
	        const isQuotedVideo = v.quoted ? ((v.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'videoMessage') : false)) : false
          if ((v.type === 'imageMessage') || isQuotedImage) { 
          const cstic = await conn.sendMessage(from , { text: 'Creating...' }, { quoted: mek } )
          var nameJpg = getRandom('')
	        isQuotedImage ? await v.quoted.download(nameJpg) : await v.download(nameJpg)
	        var stik = await imageToWebp(nameJpg + '.jpg')
	        writeExif(stik, {packname: config.STIC_WM, author: 'CyberX'})
		      .then(x => v.replyS(x))
          await conn.sendMessage(from, { delete: cstic.key })
          }else if ((v.type === 'videoMessage') || isQuotedVideo) {
	       const cstic = await conn.sendMessage(from , { text: 'creating' }, { quoted: mek } )  
	       var nameMp4 = getRandom('')
	       isQuotedVideo ? await v.quoted.download(nameMp4) : await v.download(nameMp4)
         writeExif(stik, {packname: config.STIC_WM , author: 'CyberX'})
		     .then(x => v.replyS(x))
         await conn.sendMessage(from, { delete: cstic.key })
         } else {
	       v.reply('Reply to image or video')
        }
              break 

//.......................................................Fb..............................................................\\

case 'fb' : case 'facebook' : {
	     if (!q) return await conn.sendMessage(from , { text: 'need fb link' }, { quoted: mek } ) 
         conn.sendMessage(from , { react: { text: '💎', key: mek.key }} )     
	     const isfb = q.includes('facebook.com')? q.includes('facebook.com') : q.includes('fb.watch')? q.includes('fb.watch') : ''
             if (!isfb) return await conn.sendMessage(from , { text: 'need fb link' }, { quoted: mek } )  
		
      const buttons = [
{buttonId: prefix +'sdfb ' + q, buttonText: {displayText: 'SD '}, type: 1},
{buttonId: prefix +'hdfb ' + q, buttonText: {displayText: 'HD '}, type: 1},
]
 await conn.sendMessage(from, {  text: 'Select Video Type :', buttons: buttons , headerType: 4} , { quoted: mek } )  
		      
	      }   
	      break

case 'sdfb' :
try{
    await conn.sendMessage(from, { react: { text: '💎', key: mek.key }})
    if (!q) return reply(`Give link`)
    const sdfbdown = await conn.sendMessage(from , { text: config.VIDEO_DOWN }, { quoted: mek } )
    await conn.sendMessage(from, { delete: sdfbdown.key })
    const sdfbup = await conn.sendMessage(from , { text: config.VIDEO_UP }, { quoted: mek } )
xa.downloader.facebook(q).then(data => {
conn.sendMessage(from, { video: { url: data.sd }, caption: config.CAPTION}, { quoted: mek })})
await conn.sendMessage(from, { delete: sdfbup.key })
} catch(e) {
    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
   }
            break      

            case 'hdfb' :
                try{
                    await conn.sendMessage(from, { react: { text: '💎', key: mek.key }})
                    if (!q) return reply(`Give link`)
                       const hdfbdown = await conn.sendMessage(from , { text: config.VIDEO_DOWN }, { quoted: mek } )
                       await conn.sendMessage(from, { delete: hdfbdown.key })
                       const hdfbup = await conn.sendMessage(from , { text: config.VIDEO_UP }, { quoted: mek } )
                xa.downloader.facebook(q).then(data => {
                conn.sendMessage(from, { video: { url: data.hd }, caption: config.CAPTION}, { quoted: mek })})
                await conn.sendMessage(from, { delete: hdfbup.key })
            } catch(e) {
                    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
                   }
                            break

//.......................................................Mediafire..............................................................\\                            

                            case "mediafire" :
                                case "mfire" : 
                              try {
                                conn.sendMessage(from, { react: { text: '⬇️', key: mek.key }})
                                if (!q) return reply('Give link')
                                const baby1 = await mediafire(q)
                                const filedown = await conn.sendMessage(from , { text: config.FILE_DOWN }, { quoted: mek } )
                                await conn.sendMessage(from, { delete: filedown.key })
                                const fileup = await conn.sendMessage(from , { text: config.FILE_UP }, { quoted: mek } )
                                const mfile = conn.sendMessage(from, { document: { url: baby1[0].link,}, fileName: baby1[0].nama, mimetype: baby1[0].mime,}, {quoted: mek})	
                                await conn.sendMessage(from, { delete: fileup.key })
                            } 
                              catch(e) {
                                  await conn.sendMessage(from , { text: 'error\n\n' + e }, { quoted: mek } )
                              }
                                    
                                break 
                                
//.......................................................Img..............................................................\\

case 'img': {
    conn.sendMessage(from, { react: { text: '🖼️', key: mek.key }})
if (!q) return reply("Enter a search term to get Google Image!")
reply (`*Plz Wait I\'m Uploading 5 Images Of ${q}*`)
let gis = require('g-i-s')
gis(args.join(" "), async (error, result) => {
n = result
img1 = n[0].url
img2 = n[1].url
img3 = n[2].url
img4 = n[3].url
img5 = n[4].url
conn.sendMessage(from, { image: { url: img1 }, caption: `` }, { quoted: mek })
conn.sendMessage(from, { image: { url: img2 }, caption: `` }, { quoted: mek })
conn.sendMessage(from, { image: { url: img3 }, caption: `` }, { quoted: mek })
conn.sendMessage(from, { image: { url: img4 }, caption: `` }, { quoted: mek })
conn.sendMessage(from, { image: { url: img5 }, caption: `` }, { quoted: mek })
})
}
break

//.......................................................Tiktok..............................................................\\

case 'tiktok' : {
    if (!q.includes('tiktok.com')) return reply('_Need a tiktok url_');
    const buttons = [
        {buttonId: prefix + 'nwtik '+q, buttonText: {displayText: 'No watermark'}, type: 1},
        {buttonId: prefix +'wtik '+q, buttonText: {displayText: 'With watermark'}, type: 1}
       ]
      const buttonMessage = {
          text: '_Select video type_',
          footer: config.FOOTER,
          buttons: buttons,
          headerType: 1
      }
       await conn.sendMessage(from, buttonMessage,{quoted: mek})

} 
break

case 'nwtik' :
                try{
                    await conn.sendMessage(from, { react: { text: '💎', key: mek.key }})
                    if (!q) return reply(`Give link`)
                       const hdfbdown = await conn.sendMessage(from , { text: config.VIDEO_DOWN }, { quoted: mek } )
                       await conn.sendMessage(from, { delete: hdfbdown.key })
                       const hdfbup = await conn.sendMessage(from , { text: config.VIDEO_UP }, { quoted: mek } )
                xa.downloader.facebook(q).then(data => {
                conn.sendMessage(from, { video: { url: 'https://api.akuari.my.id/downloader/tiktoknowm?link=' + q }, caption: config.CAPTION}, { quoted: mek })})
                await conn.sendMessage(from, { delete: hdfbup.key })
            } catch(e) {
                    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
                   }
                            break

                            case 'wtik' :
                                try{
                                    await conn.sendMessage(from, { react: { text: '💎', key: mek.key }})
                                    if (!q) return reply(`Give link`)
                                       const hdfbdown = await conn.sendMessage(from , { text: config.VIDEO_DOWN }, { quoted: mek } )
                                       await conn.sendMessage(from, { delete: hdfbdown.key })
                                       const hdfbup = await conn.sendMessage(from , { text: config.VIDEO_UP }, { quoted: mek } )
                                xa.downloader.facebook(q).then(data => {
                                conn.sendMessage(from, { video: { url: 'https://api.akuari.my.id/downloader/tiktokwithwm?link=' + q }, caption: config.CAPTION}, { quoted: mek })})
                                await conn.sendMessage(from, { delete: hdfbup.key })
                            } catch(e) {
                                    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
                                   }
                                            break

//.......................................................Logo..............................................................\\
case "logo" :
		     try {
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
		     
	  var srh = [];  
		   for (var i = 1; i < 9; i++) {
      srh.push({
          title: 'Logo Pack' + i,
          description: '',
          rowId: prefix + 'logo' + 1 + ' ' + q
      });
  }
    const sections = [{
      title: "Logo Pack List",
      rows: srh
  }]
    const listMessage = {
      text: 'Results for ' + q,
      footer: config.FOOTER,
      title: 'CyberX Logo Maker',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break
case "logo1" :
		     try {
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
		     
	  var srh = [];  
		   for (var i = 1; i < 13; i++) {
      srh.push({
          title: 'Logo' + i,
          description: '',
          rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/pubg?style=' + i + '&text=' + q
      });
  }
    const sections = [{
      title: "Logo List",
      rows: srh
  }]
    const listMessage = {
      text: 'Results for ' + q,
      footer: config.FOOTER,
      title: 'CyberX Logo Maker',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break
     case "logo2" :
        try {
        if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
        
 var srh = [];  
      for (var i = 1; i < 3; i++) {
 srh.push({
     title: 'Logo' + i,
     description: '',
     rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/beast?style=' + i + '&text=' + q
 });
}
const sections = [{
 title: "Logo List",
 rows: srh
}]
const listMessage = {
 text: 'Results for ' + q,
 footer: config.FOOTER,
 title: 'CyberX Logo Maker',
 buttonText: "Results",
 sections
}
await conn.sendMessage(from, listMessage, {quoted: mek })
         } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
         
break
case "logo3" :
		     try {
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
		     
	  var srh = [];  
		   for (var i = 1; i < 7; i++) {
      srh.push({
          title: 'Logo' + i,
          description: '',
          rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/pubg?style=' + i + '&text=' + q
      });
  }
    const sections = [{
      title: "Logo List",
      rows: srh
  }]
    const listMessage = {
      text: 'Results for ' + q,
      footer: config.FOOTER,
      title: 'CyberX Logo Maker',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break
     case "logo4" :
		     try {
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
		     
	  var srh = [];  
		   for (var i = 1; i < 7; i++) {
      srh.push({
          title: 'Logo' + i,
          description: '',
          rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/rrr?style=' + i + '&text=' + q
      });
  }
    const sections = [{
      title: "Logo List",
      rows: srh
  }]
    const listMessage = {
      text: 'Results for ' + q,
      footer: config.FOOTER,
      title: 'CyberX Logo Maker',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break
     case "logo5" :
		     try {
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
		     
	  var srh = [];  
		   for (var i = 1; i < 3; i++) {
      srh.push({
          title: 'Logo' + i,
          description: '',
          rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/freefire?style=' + i + '&text=' + q
      });
  }
    const sections = [{
      title: "Logo List",
      rows: srh
  }]
    const listMessage = {
      text: 'Results for ' + q,
      footer: config.FOOTER,
      title: 'CyberX Logo Maker',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break
     case "logo6" :
		     try {
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
		     
	  var srh = [];  
		   for (var i = 1; i < 3; i++) {
      srh.push({
          title: 'Logo' + i,
          description: '',
          rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/avengers?style=' + i + '&text=' + q
      });
  }
    const sections = [{
      title: "Logo List",
      rows: srh
  }]
    const listMessage = {
      text: 'Results for ' + q,
      footer: config.FOOTER,
      title: 'CyberX Logo Maker',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break
     case "logo7" :
        try {
        if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
        
 var srh = [];  
      for (var i = 1; i < 4; i++) {
 srh.push({
     title: 'Logo' + i,
     description: '',
     rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/master?style=1&text=' + i + '&text=' + q
 });
}
const sections = [{
 title: "Logo List",
 rows: srh
}]
const listMessage = {
 text: 'Results for ' + q,
 footer: config.FOOTER,
 title: 'CyberX Logo Maker',
 buttonText: "Results",
 sections
}
await conn.sendMessage(from, listMessage, {quoted: mek })
         } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
         
break
case "logo8" :
		     try {
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
		     
	  var srh = [];  
		   for (var i = 1; i < 3; i++) {
      srh.push({
          title: 'Logo' + i,
          description: '',
          rowId: prefix + 'dlogo ' + 'https://raganork-network.vercel.app/api/logo/kgf?style=5&text=' + i + '&text=' + q
      });
  }
    const sections = [{
      title: "Logo List",
      rows: srh
  }]
    const listMessage = {
      text: 'Results for ' + q,
      footer: config.FOOTER,
      title: 'CyberX Logo Maker',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break
     




     case "dlogo" :
		     try {
                reply('Genarating...')
			 
               await  conn.sendMessage(from, { image: { url: q }, caption: config.CAPTION }, { quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break

//.......................................................Down..............................................................\\

     case "down" :                            
     
     try {
                                conn.sendMessage(from, { react: { text: '⬇️', key: mek.key }})
                                if (!q) return reply('Give Direct link')
                                if (!q.includes('http')) return reply('Enter direct Link')
                                const filedown = await conn.sendMessage(from , { text: config.FILE_DOWN }, { quoted: mek } )
                                await conn.sendMessage(from, { delete: filedown.key })
                                const fileup = await conn.sendMessage(from , { text: config.FILE_UP }, { quoted: mek } )
                                const mfile = conn.sendMessage(from, { document: { url: q,}, fileName: q }, {quoted: mek})	
                                await conn.sendMessage(from, { delete: fileup.key })
                            } 
                              catch(e) {
                                  await conn.sendMessage(from , { text: 'error\n\n' + e }, { quoted: mek } )
                              }
                                    
                                break

//.......................................................Apk..............................................................\\


 
				default:
					
					if (isOwner && body.startsWith('>')) {
						try {
							await reply(util.format(await eval(`(async () => {${body.slice(1)}})()`)))
						} catch(e) {
							await reply(util.format(e))
						}
					}
					
			} 
			
		} catch (e) {
			const isError = String(e)
			
			console.log(isError)
		}
	})
}

connectToWA()