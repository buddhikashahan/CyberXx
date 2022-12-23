const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType,
    jidDecode
} = require('@adiwajshing/baileys')
const yts = require( 'secktor-pack' )
const { sms } = require('./lib/message');
const { imageToWebp, videoToWebp, writeExif } = require('./lib/stic')
const ffmpeg = require('fluent-ffmpeg');
const xa = require('xfarr-api')
const { mediafire } = require('./lib/mediafire.js')
const fetch = require('node-fetch')
const { fetchJson} = require('./lib/myfunc.js')

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
await conn.sendMessage(from, { react: {  text: "👋", key: mek.key } } )
let alivemsg = `Hello ${pushname} 

I Am Alive Now

Whatsapp Group : 
https://chat.whatsapp.com/KmE7YzrrQBk124CrpI8PCd`
let buttons = [
{buttonId: prefix + 'owner ', buttonText: {displayText: 'OWNER'}, type: 1},
{buttonId: prefix + 'menu ', buttonText: {displayText: 'MENU'}, type: 1},
{buttonId: prefix + 'runtime ', buttonText: {displayText: 'RUN TIME'}, type: 1}
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

//.......................................................Runtime..............................................................\\

case 'runtime':{          
  await conn.sendMessage(from, { react: { text: `⚙️`, key: mek.key }})
   reply (`${runtime(process.uptime())}`)
  }
  break

//.......................................................Owner..............................................................\\

case 'owner' : {
  await conn.sendMessage(from, { react: {  text: "👨‍💻", key: mek.key } } )
		const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n' 
            + `FN:` + 'Buddhika' + `\n` // full name
            + 'TEL;type=CELL;type=VOICE;waid=' + '94766866297' + ':+' + '94766866297' + '\n' // WhatsApp ID + phone number
            + 'END:VCARD'
 await conn.sendMessage(from,{ contacts: { displayName: 'noureddine_ouafy' , contacts: [{ vcard }]  }} , { quoted: mek })      
}
break 

//.......................................................Menu..............................................................\\

case 'menu' : {
  await conn.sendMessage(from, { react: {  text: "💫", key: mek.key } } )
let menumsg = `◉═════════════◉
  *🐉CyberX Commands🐉*
◉═════════════◉

┌─( *📥ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ᴄᴏᴍᴍᴀɴᴅꜱ* )

*🪄 Command :* .song
*📒 Description :* Download Songs from youtube 

*🪄 Command :* .video
*📒 Description :* Download Videos from youtube 

*🪄 Command :* .yt
*📒 Description :* Download Audio/Video from youtube 

*🪄 Command :* .img
*📒 Description :* Download images

*🪄 Command :* .fb
*📒 Description :* Download Facebook videos

*🪄 Command :* .tiktok
*📒 Description :* Download tiktok videos

*🪄 Command :* .ig
*📒 Description :* Download Instagram videos

*🪄 Command :* .mediafire 
*📒 Description :* Download mediafire files

*🪄 Command :* .apk
*📒 Description :* Download apps

└─────────◉
┌─( *🔍ꜱᴇᴀʀᴄʜ ᴄᴏᴍᴍᴀɴᴅꜱ* )

*🪄 Command :* .yts
*📒 Description :* Search videos on youtube 

*🪄 Command :* .truecaller
*📒 Description :* Find Unknown numbers

└─────────◉
┌─( *🧰ᴄᴏɴᴠᴇʀᴛ ᴄᴏᴍᴍᴀɴᴅꜱ* )

*🪄 Command :* .sticker
*📒 Description :* Convert image or video to sticker

└─────────◉
┌─( 💫ᴏᴛʜᴇʀ ᴄᴏᴍᴍᴀɴᴅꜱ )

*🪄 Command :* .alive
*📒 Description :* Check if bot is online

*🪄 Command :* .menu
*📒 Description :* Get command list

└─────────◉`
reply(menumsg)
}
break


//.......................................................Apk..............................................................\\                            

case "apk" :
		     try {
          await conn.sendMessage(from, { react: {  text: "📦", key: mek.key } } )
			 if (!q) return await conn.sendMessage(from , { text: 'need app name' }, { quoted: mek } )        
		     const data2 = await fetchJson("https://api.akuari.my.id/search/searchapk2?query=" + q)
         const data = data2.respon
		     if (data.length < 1) return await  conn.sendMessage(from, { text: 'Not Found' }, { quoted: mek } )
	  var srh = [];  
		   for (var i = 0; i < data.length; i++) {
      srh.push({
          title: data[i].title,
          description: '',
          rowId: prefix + 'dapk ' + data[i].link 
      });
  }
    const sections = [{
      title: "Playstore Search Results",
      rows: srh
  }]
    const listMessage = {
      text: " \n\n name : " + q + '\n\n ',
      footer: config.FOOTER,
      title: 'CyberX APK Downloader',
      buttonText: "Results",
      sections
  }
    await conn.sendMessage(from, listMessage, {quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break



case "dapk" : 
try {
  await conn.sendMessage(from, { react: {  text: "📥", key: mek.key } } )
  const res = await fetchJson("https://api.akuari.my.id/downloader/dlapk2?link=" + q)
  const filedown = await conn.sendMessage(from , { text: config.FILE_DOWN }, { quoted: mek } )
  await conn.sendMessage(from, { delete: filedown.key })
  const fileup = await conn.sendMessage(from , { text: config.FILE_UP }, { quoted: mek } )
  var ext = ''
  if (res.respon.linkdl.includes('.xapk')) { ext = '.xapk' } 
  else { ext = '.apk' }
  const mfile = conn.sendMessage(from, { document: { url: res.respon.linkdl ,}, fileName: 'Result' + ext , mimetype: 'application/vnd.android.package-archive',}, {quoted: mek})	
  await conn.sendMessage(from, { delete: fileup.key })
} 
catch(e) {
    await conn.sendMessage(from , { text: 'error\n\n' + e }, { quoted: mek } )
}
      
  break 


//.......................................................Instagram..............................................................\\

case'ig': case'instagram':  try{
  await conn.sendMessage(from, { react: {  text: "🎉", key: mek.key } } )
  if (!q.includes('https')) return conn.sendMessage(from , { text: 'Need Url'  }, { quoted: mek } )
 
  const viddown = await conn.sendMessage(from , { text: config.VIDEO_DOWN }, { quoted: mek } )
  await conn.sendMessage(from, { delete: viddown.key })
  const vidup = await conn.sendMessage(from , { text: config.VIDEO_UP }, { quoted: mek } )
  axios
      .get("https://api.lolhuman.xyz/api/instagram?apikey=85faf717d0545d14074659ad&url=" + q)
      .then(({ data }) => {
        
        conn.sendMessage(from, { video: { url: data.result[0] }, caption: config.CAPTION}, { quoted: mek })})
   await conn.sendMessage(from, { delete: vidup.key })
  
} catch(e) {
  await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
 }
    break

//.......................................................Truecaller..............................................................\\

case'true': case'truecaller':{
  await conn.sendMessage(from, { react: {  text: "📱", key: mek.key } } )
  let r = await fetchJson(`https://inrl-web.vercel.app/api/truecaller?number=${q}`)
    let rsltd = `
*Name:* ${r.name}

*Type:* ${r.type}

*Country:* ${r.country}

*Carrier:* ${r.carrier}

*TimeZone:* ${r.timeZone}
`
    reply(rsltd)
}
break


//.......................................................Youtube..............................................................\\
case 'yts': case 'ytsearch': {

    await conn.sendMessage(from, { react: {  text: "🔎", key: mek.key } } )
       if (!q) return reply('Example : ' + prefix + command + ' Chanux bro')
    var arama = await yts(q)
    var msg = '';
   arama.all.map((video) => {
   msg += ' *🖲️' + video.title + '*\n🔗 ' + video.url + '\n\n'
   });
   const results = await conn.sendMessage(from , { text:  msg }, { quoted: mek } )
   }
    break	
                       
                   case 'play': case 'yt': {
                    await conn.sendMessage(from, { react: {  text: "🎀", key: mek.key } } )
               
       if (!q) return reply('Example : ' + prefix + command + ' lelena')

   let search = await yts(q)
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
   }
   break
                       case 'song':  {
                        await conn.sendMessage(from, { react: {  text: "🎧", key: mek.key } } )     
       if (!q) return reply('Example : ' + prefix + command + ' lelena')
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
   }
   break
                       
                       
                       case 'video':  {
                        await conn.sendMessage(from, { react: {  text: "🎬", key: mek.key } } )
       if (!q) return reply('Example : ' + prefix + command + ' lelena')
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
   }
   break
   
   
                       
                       
   
   case 'ytmp4': 
   try {
    await conn.sendMessage(from, { react: {  text: "🎬", key: mek.key } } )
   if ( !q.includes('youtu') ) return await conn.sendMessage(from , { text: '*Need yt link*' }, { quoted: mek } )  
              let { ytv } = require('./lib/y2mate')
                     let quality = args[1] ? args[1] : '360p'
                     let media = await ytv(q, quality)

   const viddown = await conn.sendMessage(from , { text: config.VIDEO_DOWN }, { quoted: mek } )
   await conn.sendMessage(from, { delete: viddown.key })
   const vidup = await conn.sendMessage(from , { text: config.VIDEO_UP }, { quoted: mek } )
   const vid = await conn.sendMessage(from, { video: { url: media.dl_link }, mimetype: 'video/mp4', fileName: media.title + '.mp4', caption: config.CAPTION }, { quoted: mek })
   await conn.sendMessage(from, { delete: vidup.key })
} catch(e) {
    await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
   }
                 break

break
case'ytdoc': try{
  await conn.sendMessage(from, { react: {  text: "🎧", key: mek.key } } )
  if (!q.includes('https')) return conn.sendMessage(from , { text: 'Need Url'  }, { quoted: mek } )
 
  const auddown = await conn.sendMessage(from , { text: config.SONG_DOWN }, { quoted: mek } )
  await conn.sendMessage(from, { delete: auddown.key })
  const audup = await conn.sendMessage(from , { text: config.SONG_UP }, { quoted: mek } )
  axios
      .get("https://api.lolhuman.xyz/api/ytaudio2?apikey=85faf717d0545d14074659ad&url=" + q)
      .then(({ data }) => {
        let result = data.result
   conn.sendMessage(from, { document: { url:result.link }, mimetype: 'audio/mpeg', fileName:  `${result.title}.mp3` }, { quoted: mek })})
   await conn.sendMessage(from, { delete: audup.key })
  
} catch(e) {
  await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
 }
    break

    case'ytmp3': try{
      await conn.sendMessage(from, { react: {  text: "🎧", key: mek.key } } )
      if (!q.includes('https')) return conn.sendMessage(from , { text: 'Need Url'  }, { quoted: mek } )
     
      const auddown = await conn.sendMessage(from , { text: config.SONG_DOWN }, { quoted: mek } )
      await conn.sendMessage(from, { delete: auddown.key })
      const audup = await conn.sendMessage(from , { text: config.SONG_UP }, { quoted: mek } )
      axios
          .get("https://api.lolhuman.xyz/api/ytaudio2?apikey=85faf717d0545d14074659ad&url=" + q)
          .then(({ data }) => {
            let result = data.result
       conn.sendMessage(from, { audio: { url:result.link }, mimetype: 'audio/mpeg', fileName:  `${result.title}.mp3` }, { quoted: mek })})
       await conn.sendMessage(from, { delete: audup.key })
      
    } catch(e) {
      await conn.sendMessage(from , { text: 'NOT FOUND' }, { quoted: mek } ) 
     }
        break
//.......................................................Sticker..............................................................\\

case 'sticker' :
  await conn.sendMessage(from, { react: {  text: "🪄", key: mek.key } } )
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
  await conn.sendMessage(from, { react: {  text: "🧣", key: mek.key } } )
	     if (!q) return await conn.sendMessage(from , { text: 'need fb link' }, { quoted: mek } )   
	     const isfb = q.includes('facebook.com')? q.includes('facebook.com') : q.includes('fb.watch')? q.includes('fb.watch') : ''
             if (!isfb) return await conn.sendMessage(from , { text: 'need fb link' }, { quoted: mek } )  
             let fbmsg = `Select Video Quality`
             let buttons = [
             {buttonId: prefix + 'hdfb ' + q , buttonText: {displayText: 'HD'}, type: 1},
             {buttonId: prefix + 'sdfb ' + q , buttonText: {displayText: 'SD'}, type: 1}
             ]
             let buttonMessage = {
             image: {url: 'https://i.pinimg.com/736x/7c/a2/53/7ca2532387a96ae6b775ee6545b6c242.jpg'},
             caption: fbmsg,
             footer: config.FOOTER,
             buttons: buttons,
             headerType: 4,
             }
             conn.sendMessage(from, buttonMessage, { quoted: mek })
             } 
	      break

case 'sdfb' :
try{
  await conn.sendMessage(from, { react: {  text: "🧣", key: mek.key } } )
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
                  await conn.sendMessage(from, { react: {  text: "🧣", key: mek.key } } )
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
                                await conn.sendMessage(from, { react: {  text: "📁", key: mek.key } } )
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
  await conn.sendMessage(from, { react: {  text: "🖼️", key: mek.key } } )
if (!q) return reply("Enter a search term to get Google Image!")
if (q.includes('sex')) return reply("ආසයි වගේ")
if (q.includes('xxx')) return reply("ආසයි වගේ")
if (q.includes('porn')) return reply("ආසයි වගේ")
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
  await conn.sendMessage(from, { react: {  text: "🎗️", key: mek.key } } )
    if (!q.includes('tiktok.com')) return reply('_Need a tiktok url_');
    let tkmsg = `Select Video Quality`
    let buttons = [
    {buttonId: prefix + 'nwtik ' + q , buttonText: {displayText: 'Without WaterMark'}, type: 1},
    {buttonId: prefix + 'wtik ' + q , buttonText: {displayText: 'With WaterMark'}, type: 1}
    ]
    let buttonMessage = {
    image: {url: 'https://www.reviewsxp.com/blog/wp-content/uploads/2021/09/Add-a-heading-2-850x491.jpg'},
    caption: tkmsg,
    footer: config.FOOTER,
    buttons: buttons,
    headerType: 4,
    }
    conn.sendMessage(from, buttonMessage, { quoted: mek })
    } 
 
break

case 'nwtik' :
                try{
                  await conn.sendMessage(from, { react: {  text: "🎗️", key: mek.key } } )
                    
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
                                  await conn.sendMessage(from, { react: {  text: "👋🎗️", key: mek.key } } )
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
          await conn.sendMessage(from, { react: {  text: "🤹‍♀️", key: mek.key } } )
      
			 if (!q) return await conn.sendMessage(from , { text: 'Type a name' }, { quoted: mek } )        
       let text2 = args[1] ? args[1] : '.' 
       let text1 = args[0]
       const sections = [
        {
      title: "Logo Results",
      rows: [
          {title: "Arcade 8bit", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy2/arcade8bit?apikey=85faf717d0545d14074659ad&text1=" + text1 + "&text2=" + text2},
          {title: "Banner LOL", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy3/bannerlol?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Battlefield 4", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy2/battlefield4?apikey=85faf717d0545d14074659ad&&text1=" + text1 + "&text2=" + text2},
          {title: "Burn Paper", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/burnpaper?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Carved Wood", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/carvedwood?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Coffe", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/coffe?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Cup", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/cup?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Cup 2", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/cup1?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Fall Leaves", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/failleaves?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Flamming", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/flamming?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Golden Rose", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/goldenrose?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Harry Potter", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/harrypotter?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Love", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/love?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Love Message", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/lovemessage?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Nature 3D", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/nature3d?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "PUBG", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy2/pubg?apikey=85faf717d0545d14074659ad&&text1=" + text1 + "&text2=" + text2},
          {title: "Romance", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/romance?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Shadow", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/shadow?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Smoke", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/smoke?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Summer 3D", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/summer3d?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Summer Nature", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/summernature?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Tiktok", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy2/tiktok?apikey=85faf717d0545d14074659ad&text1=" + text1 + "&text2=" + text2},
          {title: "Under Grass", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/undergrass?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Under Water", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/underwater?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Wolf Metal", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/wolfmetal?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Wood Heart", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/woodheart?apikey=85faf717d0545d14074659ad&text=" + q},
          {title: "Wooden Board", rowId: prefix + "dlogo " + "https://api.lolhuman.xyz/api/photooxy1/woodenboard?apikey=85faf717d0545d14074659ad&text=" + q}
          
      ]
        },
      
    ]
    
   
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
          await conn.sendMessage(from, { react: {  text: "🪄", key: mek.key } } )
                reply('Genarating...')
			 
               await  conn.sendMessage(from, { image: { url: q }, caption: config.CAPTION }, { quoted: mek })
		      } catch(e) {
await conn.sendMessage(from , { text: 'error' }, { quoted: mek } )  
} 
		      
	 break

//.......................................................Down..............................................................\\

     case "down" :                            
     
     try {
      await conn.sendMessage(from, { react: {  text: "⬇️", key: mek.key } } )            
                                if (!q) return reply('Give Direct link')
                                if (!q.includes('http')) return reply('Enter direct Link')
                                const filedown = await conn.sendMessage(from , { text: config.FILE_DOWN }, { quoted: mek } )
                                await conn.sendMessage(from, { delete: filedown.key })
                                const fileup = await conn.sendMessage(from , { text: config.FILE_UP }, { quoted: mek } )
                                const mfile = conn.sendMessage(from, { document: { url: args[0],}, fileName: args[0] + args[1] }, {quoted: mek})	
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