# Ranking Server Discord Bot
 A discord bot for managing ranks/roles in the AOTTG Ranking discord server

# Commands
Admin Commands:
!help - lists commands
!listcategories
!listranks <category>
!create <category> <ranks, rp, rank_image>
!delete <category>
!edit <category> --rename <new_name> --rankdelete <ranks> --rpchange <rank, rp> --renamerank <rank, new_rank_name>
!give <player_name> <category> <rank> - no edit here as give will override whatever the current rank is.
!remove <player_name> <category> <rank>
!purge <player_name> - remove all ranks from player
!scoreboard - give me format for this, it should also auto update when players change rp scores within the top 50.

User Commands:
  !rank [|player_name] - no arg gives your own rank, player name arg gives the player listed's rank
    -- Give me a format for this message
  list any other commands you might want