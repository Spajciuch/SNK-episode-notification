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

const animeTitles = ["Shingeki no Kyojin", "Yakusoku no Neverland", "Dr. Stone", "Beastars"]

type thumbnailsInfo = {
    [key: string]: string
}

const thumbnails: thumbnailsInfo = {
    "Shingeki no Kyojin": "https://media.comicbook.com/2020/12/attack-on-titan-season-4-poster-visual-1247732-1280x0.jpeg",
    "Yakusoku no Neverland": "https://images.saymedia-content.com/.image/t_share/MTc0NDg0MjM5MDU5MDY4MjY0/animes-like-yakusoku-no-neverland.jpg",
    "Dr. Stone": "http://blog.tanuki.pl/wp-content/uploads/2019/07/dr-stone-1-1.jpg",
    "Beastars": "https://i.pinimg.com/originals/13/19/4e/13194e17a0fc42a2392d9a61d451f446.jpg"
}
const domains = ["https://snk.wbijam.pl/czwarta_seria-${number}.html", "https://ynn.wbijam.pl/druga_seria-${number}.html", "https://drstone.wbijam.pl/druga_seria-${number}.html", "https://frixysubs.pl/index.php?anime=Beastars%202nd%20Season&sezon=0&odcinek=0"]

const check = function () {
    rl.question("1. Shingeki no Kyojin\n2. Yakusoku no Neverland\n3. Dr. Stone\n4. Beastars\nWybierz anime do sprawdzenia: ", function (index) {
        rl.question("Podaj numer odcinka do sprawdzenia: ", function (number) {
            console.log(`Czekanie na pojawienie się odcinka ${number}`)
            if (Number(index) < 4) {
                number = number.padStart(2, "0")

                const fetchInterval = setInterval(function () {
                    fetch(domains[Number(index) - 1].replace("${number}", number))
                        .then(res => res.text())
                        .then(body => {
                            const translated = !body.includes("zwiastun odcinka") && body.includes("oglądaj")

                            const episodeObject = {
                                link: domains[Number(index) - 1].replace("${number}", number),
                                title: animeTitles[Number(index) - 1]
                            }

                            if (translated) {
                                client.emit("episodeAppeared", episodeObject)
                                clearInterval(fetchInterval)
                            }
                        })
                }, 1000)
            } else {
                fetch(domains[Number(index) - 1])
                    .then(res => res.text())
                    .then(body => {
                        const translated = body.includes(`#${number}`)

                        const episodeObject = {
                            link: domains[Number(index) - 1].replace("odcinek=0", `odcinek=${number}`),
                            title: animeTitles[Number(index) - 1]
                        }

                        if (translated) {
                            client.emit("episodeAppeared", episodeObject)
                        }
                    })
            }
        })
    })
}

client.on("ready", () => {
    console.log(`[discord.js] Discord client logged in`)
    check()
})

client.on("episodeAppeared", episodeObject => {
    console.log("Odcinek się pojawił!")

    const spyte = client.users.cache.get("367390191721381890")

    const embed = new Discord.MessageEmbed()
        .setColor('#00aaff')
        .setTitle(episodeObject.title)
        .setThumbnail(thumbnails[episodeObject.title])
        .setDescription(`• Pojawił się nowy odcinek serii **${episodeObject.title}**\n• Dostępny [tutaj](${episodeObject.link})`)
        .setTimestamp()
    spyte.send(embed).then(() => process.exit())
})

client.login(process.env.TOKEN)