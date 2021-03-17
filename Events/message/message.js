// ██████ Integrations █████████████████████████████████████████████████████████

// —— Base structure
const Event = require('../../Structures/Event');

// ██████ | █████████████████████████████████████████████████████████████████████

class message extends Event {

    constructor(client) {
        super(client);
    }

    async run(message) {

        const client = this.client
            , langue = client.language[ message.guild && message.guild.local || "EN" ].message;

        // —— If message.member is uncached, fetch it
        if ( !message.member && message.guild )
            message.member = await message.guild.members.fetch( message.author );

        // —— Message log in the database
        client.config.logger && new client.db.Message({
            _ID         : message.id,
            _userID     : message.author.id,
            _guildID    : message.guild && message.guild.id || "DM",
            _channelID  : message.channel && message.channel.id || "DM",
            content     : message.cleanContent,
            attachments : message.attachments.size !== 0 && message.attachments.first().url,
            timestamp   : message.createdTimestamp,
        }).save().catch( ( err )  => console.error( err) );

        // —— Exclude messages from bot or system
        if ( message.author.bot || message.system )
            return;

        // —— Experience module
        if ( message.guild && message.guild.plugins.experience.enable ) {
            // —— Search in the database if the member exists
            let member = await client.db.Member.findOne({
                _ID         : message.author.id,
                _guildID    : message.guild.id
            }).exec();

            if ( !member ) {
                // —— If it does not exist, it is created
                member = await new client.db.Member({
                    _ID         : message.author.id,
                    _guildID    : message.guild.id,
                    joinDate    : message.member.joinedAt,
                }).save().catch(console.error);

            }

            // —— Give a random amount of xp per message
            let gain = ~~( Math.random() * 50 ) + 1;

            // –– Lucky drop, 1 chance in 100 to multiply the gain by 100
            if ( ~~( Math.random() * 101 ) === 100 )
                message.react( "🔥" ) && ( gain *= 100 );

            // —— Adds the gain to the old xp
            member.experience += gain;

            const curLevel = ~~( 0.1 * Math.sqrt( member.experience) );

            // —— LVL UP ! *Victory Fanfare* (Final Fantasy XI)
            if( member.level < curLevel ) {

                member.level++;
                message.reply( `YES ! LVL ${curLevel}` );

            }

            // —— Saving the updated experience and level in the database
            client.db.Member.findOneAndUpdate({
                _ID         : message.author.id,
                _guildID    : message.guild.id
            }, {
                experience  : member.experience,
                level       : member.level
            }).exec();

        }

        // —— Keeps a default prefix if the command is not executed in a guild.
        const prefix = message.guild ? message.guild.prefix : "£";

        // —— Exclude messages those not starting with prefix
        if ( !message.content.startsWith( prefix ) )
            return;

        // —— Message decomposition
        const [ cmd, ...args ] = message.content.slice( prefix.length ).trim().split( / +/g );

        const command = client.commands.get( cmd.toLowerCase() ) || client.commands.get( client.aliases.get( cmd.toLowerCase() ) );

        // —— If no aliases or command files are found, stop.
        if ( !command )
            return;

        // —— Stop if the command is disabled
        if ( message.guild && message.guild.disabledCommands.includes( cmd ) )
            return;

        // —— If the command can only be executed by the master
        if ( command.ownerOnly && client.config.Master !== message.author.id )
            return message.reply( langue.owner );

        // —— Checks if the command can be executed in DM
        if ( command.guildOnly && !message.guild )
			return message.reply( langue.server );

        // —— If the command can only be executed in a NSFW channel
		if ( command.nsfw && !message.channel.nsfw )
            return message.reply( langue.nsfw );

        // —— Checks if the command for this user is under cooldown
        if ( command.cmdCooldown.has( message.author.id ) )
            return message.delete({ timeout: 10000 })
                && message.reply( langue.cooldown( command, message ) )
                   .then( ( msg ) => msg.delete({ timeout: 10000 }) );

        // —— Checks if arguments are required and if they are present
        if ( command.args && !args.length )
            return message.channel.send( !command.usage || "" ? langue.args : { embed : langue.helpEmbed } );

        if ( message.guild ) {

            const userPerms = message.channel.permissionsFor( message.member ).missing( command.userPerms );

            if ( userPerms.length )
                return message.reply( langue.youMiss );

            const botPerms = message.channel.permissionsFor( client.user ).missing( command.botPerms );

			if ( botPerms.length )
				return message.reply( langue.missPerm );

        }

        command.setMessage( message );

        // —— Run the command
        command.run( message, args );

        // —— Starts the cooldown if it is set
        if ( command.cooldown > 0 ) command.startCooldown( message.author.id );
    }
}

module.exports = message;