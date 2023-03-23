const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType,
    jidDecode
} = require('@adiwajshing/baileys')

const fs = require('fs')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const util = require('util')
const config = require('./config')
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

	const tech = JSON.parse(fs.readFileSync('./database/tech.json'));
	const news = JSON.parse(fs.readFileSync('./database/news.json'));
	const axios = require('axios');
	const cheerio = require('cheerio');
	const jid = "120363042887263467@g.us"
	const jid2 = "120363042887263467@g.us"
	const url = 'https://androidwedakarayo.com';

	setInterval(function sendData() {	
	axios.get(url)
	  .then(response => {
		const $ = cheerio.load(response.data);
		const latestArticleLink = $('.row div article figure a').attr('href');
	
		axios.get(url + latestArticleLink)
		  .then(response => {
			const $ = cheerio.load(response.data);
			const title = $('h1.post-title').text().trim();
			const description = $('.post-body p, .post-body h2').map((i, el) => $(el).text().trim()).get().join('\n\n');
			const img = $('.post-image img').attr('src');
			const imageLinks = []
	
			$('.post-body img').each(function () {
				imageLinks.push($(this).attr('src'));
			  });
			  
			async function message() {    
	if (!tech.includes(latestArticleLink)){
	tech.push(latestArticleLink)
	fs.writeFileSync('./database/tech.json', JSON.stringify(tech))
	await conn.sendMessage(jid, { image: { url: url + img }, caption: '*' + title + '*\n\n' + description}); 
    await conn.sendMessage(jid2, { image: { url: url + img }, caption:  '*' + title + '*\n\n' + description}); 
   for (let i = 0; i < imageLinks.length; i++) {
			await conn.sendMessage(jid, { image: { url: imageLinks[i] }}); 
		    await conn.sendMessage(jid2, { image: { url: imageLinks[i] }});
		 }
		
			}}

			message();
		
		  })
		  .catch(error => {
			console.error(error);
		  });
	  })}, 5000)




	  const {Esana} = require("esana-node-api")

setInterval(async function esana(){
const jid1 = "120363059673461341@g.us"
const esana =  new Esana()
await esana.verify('user2086823') 
const esana_data = await esana.esana_latest()
const n = await esana_data.news.helakuru
if (!news.includes(n.news_id)){
	news.push(n.news_id)
	fs.writeFileSync('./database/news.json', JSON.stringify(news))
	await conn.sendMessage(jid1, { image: { url: n.thumb }, caption: '*' + n.title + '*\n' + n.data + '\n\n' + n.description});  
	for (let i = 0; i < imageLinks.length; i++) {
		await conn.sendMessage(jid1, { image: { url: n.media[i] }}); 
	 }
		 }

}, 5000)

/*
	const jid2 = "94766866297@s.whatsapp.net"
	const data2 = axios.get("https://api.sdbots.tk/hirunews")
	const data = data2.data
	
		setInterval(async function sendData() {
			if (!news.includes(data.img)){
				news.push(data.img)
				fs.writeFileSync('./database/news.json', JSON.stringify(news))}
				await conn.sendMessage(jid2, { image: { url: data.img }, caption: `*${data.title}*
		        
				${data.description}
				
				${data.date}` }); 
		}, 5000)

	  */
	  

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
				
				case 'jid' : {
					reply(from)
				}
				break
				
				
				
						   
				
					 
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
