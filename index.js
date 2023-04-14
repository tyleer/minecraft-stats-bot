const ms = require('ms')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const mineflayer = require('mineflayer')
const cmd = require('mineflayer-cmd').plugin
const client = new Discord.Client()
require('discord-reply');

const config = require('./config.json')


const updateChannel = async () => {


    const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
    if (!res) {
        const statusChannelName = `📡︲Durum:`
        client.channels.cache.get(config.statusChannel).setName(statusChannelName)
        return false
    }

    const body = await res.json()


    const players = body.players.now
    const serverAd = config.serverAD

    client.user.setActivity(players + " kişi " + serverAd);


    const status = (body.online ? "Aktif" : "Kapalı")


    const playersChannelName = `👥︲Oyuncular: ${players}`
    const statusChannelName = `📡︲Durum: ${status}`


    client.channels.cache.get(config.playersChannel).setName(playersChannelName)
    client.channels.cache.get(config.statusChannel).setName(statusChannelName)

    return true
}

client.on('ready', () => {
    console.log(`${client.user.tag} olarak giriş yaptım!`)
    setInterval(() => {
        updateChannel()
    }, ms(config.updateInterval))
})

client.on('message', async (message) => {

    if (message.content === `${config.prefix}güncelle`) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply('Bu komutu sunucu moderatörleri kullanabilir.')
        }
        const kanalguncelleme = await message.lineReply("Kanallar güncelleniyor lütfen bekleyiniz...")
        await updateChannel()
        kanalguncelleme.edit("**Kanallar başarıyla güncellendi!**")
    }

    if (message.content === `${config.prefix}durum`) {
        const istatistikmsg = await message.lineReply("İstatistikler toplanıyor lütfen bekleyin...")


        const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
        if (!res) return message.channel.send(`Görünüşe göre sunucunuza erişilemiyor. Lütfen çevrimiçi olduğunu ve erişimi engellemediğini onaylayın.`)

        const body = await res.json()
        const embed = new Discord.MessageEmbed()
            .setAuthor(config.ipAddress)
            .setThumbnail(body.favicon)
            .addField("Version", body.server.name)
            .addField("Aktif", `${body.players.now} kişi`, true)
            .addField("Maximum Oyuncu", `${body.players.max} kişi`, true)
            .addField("Motd", body.motd)
            .addField("Durum", (body.online ? "Aktif :green_circle: " : "Kapalı :red_circle: "))
            .setThumbnail(message.author.avatarURL({dynamic: true}))
            .setTimestamp()
            .setFooter(`${message.author.username} tarafından istendi`)
            .setColor("#FF0000")

        istatistikmsg.edit(`:chart_with_upwards_trend: İşte **${config.ipAddress}** istatistikleri:`, { embed })
    }

})

client.login(config.token)
