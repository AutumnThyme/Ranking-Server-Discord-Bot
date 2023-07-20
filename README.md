# Ranking Server Discord Bot

# Commands
## Admin Commands: (Must have Admin or Recruiter role)
```
/create <category> <rank> <use_default_ranks> <ranks|optional>
* if use_default_ranks is true, it will read a default ranks file on the server and
* populate the ranks from that (Bronze [I|II|III] through Grandmaster [I|II|III|X])
* otherwise, specify a json object in the form:
{
  "ranks": [
    {
      'name': <string>,
      'rp': <number>,
      'image': <string>
    }
    ...
  ]
}
```

```
/delete <category>
* deletes the category and all ranks under it.
* these ranks are also remove from all users who had it.
* this will update the leaderboard if it has been created.
```

```
/edit <category> <rank_edit_json>
* applies the rules from rank_edit_json to the ranks under the designated category.
* format of rank_edit_json is as follows:
{
  changeCategoryName: bool
  newCategoryName: string
  rankEdits: [
    { oldRankName: string, newRankName: string, editRankRp: bool, newRankRp: number },
    { deleteRank: string }
  ]
}
* changeCategoryName when set to true will rename the category to {{newCategoryName}}.
* the rank edits array is a series of edits to be made on the category.
* the first type noted is an edit which takes in the oldRankName, a new rank name, a boolean on whether to change the rp value of the rank, and the number to change it to.
* the second type will delete the rank under the category by the name given to the {{deleteRank}} field.
```

```
/giverank <category> <rank> <player>
* assigns the designated rank and category pair to the player given that it exists.
* you can check the existing categories using /listcategories.
* you can check the existing ranks under a category using /listranks <category>.
* this will update the leaderboard.
```

```
/removerank <category> <rank> <player>
* All the same as above except it removes the rank from the player.
```

```
/makescoreboard <name|optional>
* makes the scoreboard with name {{name}} right under the place the command was typed.
* generally speaking, use the default value "Leaderboard" by not entering anything for the optional argument as the other feature is not fully supported yet.
```

```
/deletescoreboard <name|optional>
* same as above except it deletes the scoreboard with name {{name}}.
* just use defaults for now.
```

## User Commands: (No roles required)
```
/viewprofile <mention|optional>
* Displays the profile of the mentioned user or the user running the command if no argument is given.
```
