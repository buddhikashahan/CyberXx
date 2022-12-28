const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType,
    jidDecode
} = require('@adiwajshing/baileys')
const { sms } = require('./lib/message');
const { imageToWebp, videoToWebp, writeExif } = require('./lib/stic')
const ffmpeg = require('fluent-ffmpeg');
const xa = require('xfarr-api')
const { mediafire } = require('./lib/mediafire.js')
const fetch = require('node-fetch')
const { fetchJson} = require('./lib/myfunc.js')
let yts = require('yt-search')

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
			
        
			switch (command) {


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
       let txt2 = args[1] ? args[1] : '.' 
       let txt1 = args[0]
       const sections = [
        {
      title: "Logo Results",
      rows: [
        {title: "Shadow", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/shadow?text=" + q},
        {title: "Cup", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/cup?text=" + q},
        {title: "Romantic", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/romantic?text=" + q},
        {title: "Smoke", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/smoke?text=" + q},
        {title: "Burn Paper", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/burn_paper?text=" + q},
        {title: "Naruto", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/naruto?text=" + q},
        {title: "Love Message", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/love_message?text=" + q},
        {title: "TikTok", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/tik_tok?text=" + txt1 + "&text_2=" + txt2 },
        {title: "Flower Heart", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/flower_heart?text=" + q},
        {title: "Wodden Board", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/wodden_board?text=" + q},
        {title: "Glowing Neon", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/glowing_neon?text=" + q},
        {title: "Butterfly", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/butterfly?text=" + q},
        {title: "Metallic", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/metallic?text=" + q},
        {title: "Kayu", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/kayu?text=" + q},
        {title: "Horror", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/horror?text=" + q},
        {title: "Permen", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/permen?text=" + q},
        {title: "Silk", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/silk?text=" + q},
        {title: "Batik", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/batik?text=" + q},
        {title: "Nature 3D", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/nature3d?text=" + q},
        {title: "Summer 3D", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/summer3d?text=" + q},
        {title: "Faill", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/fall?text=" + q},
        {title: "Neon Lights", rowId: prefix + "dlogo " + "https://api.akuari.my.id/photooxy/neonlights?text=" + q}
                
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