import * as readline from "readline"
import * as dotenv from "dotenv"
import fetch from "node-fetch"
import * as Discord from "discord.js"

dotenv.config()

const client = new Discord.Client()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const check = function () {
    rl.question("Podaj numer odcinka do sprawdzenia: ", function (number) {
        console.log(`Czekanie na pojawienie się odcinka ${number}`)

        const fetchInterval = setInterval(function () {
            fetch(`https://snk.wbijam.pl/czwarta_seria-${number}.html`)
                .then(res => res.text())
                .then(body => {
                    const translated = !body.includes("zwiastun odcinka")

                    if (translated) {
                        client.emit("episodeAppeared", `https://snk.wbijam.pl/czwarta_seria-${number}.html`)
                        clearInterval(fetchInterval)
                    }
                })
        }, 1000)
    })
}

client.on("ready", () => {
    console.log(`[discord.js] Discord client logged in`)
    check()
})

client.on("episodeAppeared", link => {
    console.log("Odcinek się pojawił!")

    const spyte = client.users.cache.get("367390191721381890")

    const embed = new Discord.MessageEmbed()
        .setColor('#00aaff')
        .setTitle("Shingeki no Kyojin")
        .setThumbnail("https://media.comicbook.com/2020/12/attack-on-titan-season-4-poster-visual-1247732-1280x0.jpeg")
        .setDescription(`• Pojawił się nowy odcinek serii **Shingeki no Kyojin**\n• Dostępny [tutaj](${link})`)
        .setTimestamp()
    spyte.send(embed).then(() => process.exit())
})

client.login(process.env.TOKEN)