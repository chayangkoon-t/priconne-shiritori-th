let shiritori_game = {
    // CONSTANTS
    sender_name: "Shiritori",
    localstorage_location: "collection",
    max_words_per_row: 10,

    // COLLECTION
    collected_words: [],

    futsuyomi_collected_phrases: 0,
    urayomi_collected_phrases: 0,
    priconneyomi_collected_phrases: 0,

    futsuyomi_total_phrases: 0,
    urayomi_total_phrases: 0,
    priconneyomi_total_phrases: 0,

    unsaved_changes: false,

    // GAME VARIABLES
    turn_count: 0,
    rush_mode: false,
    last_phrase_played: '',
    new_phrase_collected: false,
};

function shiritori(word_id, phrase, phrase_type) {
    console.log(get_colored_message(shiritori_game.sender_name, "Selected " + highlight_code(word_id) + " ; " + highlight_code(phrase) + " ; " + highlight_code(phrase_type), message_status.INFO));

    // GAME STARTING?
    if (shiritori_game.turn_count === 0) {
        shiritori_game.turn_count++;
        shiritori_game.last_phrase_played = '';
        shiritori_game.new_phrase_collected = false;
        document.getElementById("turn-counter").innerHTML = shiritori_game.turn_count;
        document.getElementById("turn-text").hidden = false;
        document.getElementById("game-start-tip").hidden = true;
        document.getElementById("your-turn-text").hidden = false;
        document.getElementById("latest-selection").hidden = false;
        document.getElementById("word-list-contents").hidden = true;
        document.getElementById("word-list-hidden-warning").hidden = false;
        document.getElementById("undo-button").hidden = false;
    } else {
        // ENABLE UNDO BUTTON
        document.getElementById("undo-button").disabled = false;
        shiritori_game.last_phrase_played = document.getElementById("latest-selection-image").alt;

        if (!shiritori_game.rush_mode) {
            if (!document.getElementById("your-turn-text").hidden) {
                // YOUR TURN HAS JUST PASSED
                document.getElementById("your-turn-text").hidden = true;
                document.getElementById("opponent-turn-text").hidden = false;
                document.getElementById("rush-mode-button-text").hidden = false;
            } else {
                // KAYA'S TURN HAS JUST PASSED
                document.getElementById("your-turn-text").hidden = false;
                document.getElementById("opponent-turn-text").hidden = true;
                document.getElementById("rush-mode-button-text").hidden = true;

                // INCREASE TURN COUNTER
                shiritori_game.turn_count++;
                document.getElementById("turn-counter").innerHTML = shiritori_game.turn_count;
            }
        }
    }
    // UPDATE LATEST SELECTION
    update_latest_selection(word_id, phrase, phrase_type);

    // ADD WORD TO COLLECTION
    add_word_to_collection(word_id, phrase, phrase_type);

    // BUILD NEW LIST OF POSSIBLE WORDS
    get_possible_words(phrase);
}

function update_latest_selection(word_id, phrase, phrase_type) {
    document.getElementById("latest-selection-image").src = "images/game/" + word_id + ".png";
    document.getElementById("latest-selection-image").alt = word_id + ";" + phrase + ";" + phrase_type;
    document.getElementById("latest-selection-character").innerHTML = get_last_character(phrase);
    document.getElementById("latest-selection-text").innerHTML = phrase;

    document.getElementById("latest-selection-character").classList.remove(word_list_keys.futsuyomi);
    document.getElementById("latest-selection-character").classList.remove(word_list_keys.urayomi);
    document.getElementById("latest-selection-character").classList.remove(word_list_keys.priconneyomi);
    document.getElementById("latest-selection-character").classList.add(phrase_type);
}

function undo_phrase() {
    if (shiritori_game.last_phrase_played !== '') {
        let phrase_data = shiritori_game.last_phrase_played.split(';');
        let phrase_data_current = document.getElementById("latest-selection-image").alt.split(';');

        // DISABLE UNDO BUTTON
        document.getElementById("undo-button").disabled = true;

        // REMOVE CURRENT WORD FROM COLLECTION IF NEW
        if (shiritori_game.new_phrase_collected) {
            remove_word_from_collection(phrase_data_current[0], phrase_data_current[1], phrase_data_current[2]);
        }

        // REVERSE GAME STATUS
        if (!shiritori_game.rush_mode) {
            if (document.getElementById("your-turn-text").hidden) {
                // IT IS CURRENTLY KAYA'S TURN, GO BACK TO PLAYER'S TURN
                document.getElementById("your-turn-text").hidden = false;
                document.getElementById("opponent-turn-text").hidden = true;
                document.getElementById("rush-mode-button-text").hidden = true;
            } else {
                // IT IS CURRENTLY THE PLAYER'S TURN, GO BACK TO KAYA'S TURN
                document.getElementById("your-turn-text").hidden = true;
                document.getElementById("opponent-turn-text").hidden = false;
                document.getElementById("rush-mode-button-text").hidden = false;

                // DECREASE TURN COUNTER
                shiritori_game.turn_count--;
                document.getElementById("turn-counter").innerHTML = shiritori_game.turn_count;
            }
        }

        // HIDE - CHARACTER HIT TEXT
        document.getElementById("n-character-hit-text").hidden = true;

        // UPDATE LATEST SELECTION
        update_latest_selection(phrase_data[0], phrase_data[1], phrase_data[2]);

        // BUILD NEW LIST OF POSSIBLE WORDS
        get_possible_words(phrase_data[1]);

        console.log(get_colored_message(shiritori_game.sender_name, "Last move has been undone. Going back to " + highlight_code(shiritori_game.last_phrase_played), message_status.SUCCESS));
    }
}

function add_word_to_collection(word_id, phrase, phrase_type) {
    let word = word_id + ";" + phrase + ";" + phrase_type;

    // CHECK IF WORD EXISTS IN COLLECTION
    if (!shiritori_game.collected_words.includes(word)) {
        console.log(get_colored_message(shiritori_game.sender_name, "New word collected: " + highlight_code(word), message_status.SUCCESS));
        shiritori_game.new_phrase_collected = true;

        try {
            if (!document.getElementById(word_id + "-" + phrase).classList.contains("low-opacity")) {
                document.getElementById(word_id + "-" + phrase).classList.add("low-opacity");
            }
            switch (phrase_type) {
                case word_list_keys.futsuyomi:
                    shiritori_game.futsuyomi_collected_phrases++;
                    document.getElementById("futsuyomi-count").innerHTML = shiritori_game.futsuyomi_collected_phrases;
                    break;
                case word_list_keys.urayomi:
                    shiritori_game.urayomi_collected_phrases++;
                    document.getElementById("urayomi-count").innerHTML = shiritori_game.urayomi_collected_phrases;
                    break;
                case word_list_keys.priconneyomi:
                    shiritori_game.priconneyomi_collected_phrases++;
                    document.getElementById("priconneyomi-count").innerHTML = shiritori_game.priconneyomi_collected_phrases;
                    break;
                default:
                    // IGNORED
                    break;
            }

            // ADD WORD TO COLLECTION
            shiritori_game.collected_words.push(word);

            // SAVE DATA
            localStorage.setItem(shiritori_game.localstorage_location, JSON.stringify(shiritori_game.collected_words));

            // CHECK IF COMPLETE OR NOT
            check_if_word_complete(word_id);
        } catch (e) {
            console.log(get_colored_message(shiritori_game.sender_name, "\tOops, maybe not... this word has problems! Removing it from existence instead.", message_status.WARNING));
            alert("The following word has been removed from your saved data:\n" + word_id + " ; " + phrase + " ; " + phrase_type + "\n\nGo to Word List and re-enable the word if needed.");
        }
    } else {
        shiritori_game.new_phrase_collected = false;
    }
}

function remove_word_from_collection(word_id, phrase, phrase_type) {
    let word = word_id + ";" + phrase + ";" + phrase_type;

    // CHECK IF WORD EXISTS IN COLLECTION
    if (shiritori_game.collected_words.includes(word)) {
        console.log(get_colored_message(shiritori_game.sender_name, "Word removed: " + highlight_code(word), message_status.WARNING));

        if (document.getElementById(word_id + "-" + phrase).classList.contains("low-opacity")) {
            document.getElementById(word_id + "-" + phrase).classList.remove("low-opacity");
        }
        switch (phrase_type) {
            case word_list_keys.futsuyomi:
                shiritori_game.futsuyomi_collected_phrases--;
                document.getElementById("futsuyomi-count").innerHTML = shiritori_game.futsuyomi_collected_phrases;
                break;
            case word_list_keys.urayomi:
                shiritori_game.urayomi_collected_phrases--;
                document.getElementById("urayomi-count").innerHTML = shiritori_game.urayomi_collected_phrases;
                break;
            case word_list_keys.priconneyomi:
                shiritori_game.priconneyomi_collected_phrases--;
                document.getElementById("priconneyomi-count").innerHTML = shiritori_game.priconneyomi_collected_phrases;
                break;
            default:
                // IGNORED
                break;
        }

        // REMOVE WORD FROM COLLECTION
        let word_index = shiritori_game.collected_words.indexOf(word);
        if (word_index > -1) {
            shiritori_game.collected_words.splice(word_index, 1);
        }

        // SAVE DATA
        if (shiritori_game.collected_words.length > 0) {
            localStorage.setItem(shiritori_game.localstorage_location, JSON.stringify(shiritori_game.collected_words));
        } else {
            // COLLECTION IS EMPTY, DELETE SAVED DATA.
            if (localStorage.getItem(shiritori_game.localstorage_location) !== null) {
                localStorage.removeItem(shiritori_game.localstorage_location);
            }
        }

        // CHECK IF COMPLETE OR NOT
        check_if_word_complete(word_id);
    }
}

function get_possible_words(phrase) {
    // NOTE THAT THIS IS IN HIRAGANA, KATAKANA CHARACTERS MUST BE CHECKED AS WELL
    let end_character = get_last_character(phrase);
    let table_html = "";
    let counter = 0;
    let is_player_turn = !document.getElementById("your-turn-text").hidden;
    let missing_phrase_map = get_missing_phrase_map();
    let npc_choices_map = get_npc_choice_map();

    // FIRST CHARACTER OF A PHRASE THAT MATCHES IN HIRAGANA OR KATAKANA = POSSIBLE
    for (let [word_id, word_data] of word_list) {
        let possible_words = [];
        // COLLECT POSSIBLE PHRASES FROM WORD
        for (let i = 0; i < word_data.get(word_list_keys.futsuyomi).length; i++) {
            //let first_character = [0];
            let first_character = get_first_character(word_data.get(word_list_keys.futsuyomi)[i])
            if (end_character === first_character) {
                possible_words.push({
                    [word_data.get(word_list_keys.futsuyomi)[i]]: word_list_keys.futsuyomi
                });
            }
        }
        for (let i = 0; i < word_data.get(word_list_keys.urayomi).length; i++) {
            let first_character = get_first_character(word_data.get(word_list_keys.urayomi)[i]);
            if (end_character === first_character) {
                possible_words.push({
                    [word_data.get(word_list_keys.urayomi)[i]]: word_list_keys.urayomi
                });
            }
        }
        for (let i = 0; i < word_data.get(word_list_keys.priconneyomi).length; i++) {
            let first_character = get_first_character(word_data.get(word_list_keys.priconneyomi)[i]);
            if (end_character === first_character) {
                possible_words.push({
                    [word_data.get(word_list_keys.priconneyomi)[i]]: word_list_keys.priconneyomi
                });
            }
        }

        // DISPLAY POSSIBLE RESULTS
        for (let i = 0; i < possible_words.length; i++) {
            // (word_id, {phrase : phrase_type})
            // phrase_type = futsuyomi | urayomi | priconneyomi ; determine color of character
            add_word_to_table_html(word_id, possible_words[i]);
        }
    }
    // CLOSE TABLE
    table_html += "</tr></tbody>";
    document.getElementById("selection-table").innerHTML = table_html;

    // POSSIBLE WORD COUNT = 0? A - WAS PROBABLY HIT
    if (counter === 0) {
        document.getElementById("n-character-hit-text").hidden = false;
        console.log(get_colored_message(shiritori_game.sender_name, highlight_code("-") + " was hit! Game Over!", message_status.INFO));
    }

    function add_word_to_table_html(word_id, phrase_data) {
        // ADD TABLE ROW IF FIRST WORD
        if (counter === 0) {
            table_html += "<tr class='border'>";
        }

        // CLOSE TABLE ROW AND START NEW IF LIMIT HAS BEEN REACHED
        if (counter % shiritori_game.max_words_per_row === 0 && counter !== 0) {
            table_html += "</tr><tr>";
        }

        let phrase = Object.keys(phrase_data)[0];
        let phrase_type = phrase_data[phrase];
        let is_word_already_collected = shiritori_game.collected_words.includes(word_id + ";" + phrase + ";" + phrase_type);

        // IF IT IS KAYA'S TURN
        // CHANGE PRICONNEYOMI WORDS TO GRAYSCALE SINCE SHE'LL NEVER PICK THEM
        let phrase_highlight = "";
        let color_highlight = "";
        let additional_title_text = "";
        let last_character = get_last_character(phrase);
        let kaya_new_phrases = missing_phrase_map.get(last_character);
        if (!is_player_turn) {
            // PHRASE IS NOT A PRICONNEYOMI
            if (phrase_type === word_list_keys.priconneyomi) {
                phrase_highlight = "grayscale ";
            } else {
                // COLOR HIGHLIGHT GOLD IF THERE IS A WORD THAT A PLAYER NEEDS
                color_highlight = (missing_phrase_map.get(last_character).length > 0 ? "gold-outline " : "");
            }
        } else {
            // COLOR HIGHLIGHTING:
            //
            // NO COLOR: USER HAS NO CHANCE OF GETTING A PHRASE THEY NEED EVEN AFTER KAYA SELECTS SOMETHING
            // COLOR 1 (GREEN): KAYA HAS A CHANCE OF SELECTING A PHRASE THE USER NEEDS
            // COLOR 2 (BLUE): USER HAS A CHANCE OF SELECTING A PHRASE THEY NEED AFTER KAYA SELECTS
            // COLOR 3 (RED): KAYA CAN SELECT A PHRASE THE USER IS MISSING AND THE USER CAN SELECT ONE TOO
            let kaya_can_select_new_phrase = false;
            let user_can_select_new_phrase = false;
            let kaya_and_user_can_select_new_phrases = false;

            let kaya_phrases_string = "";
            let user_phrases_string = "";
            let kaya_and_user_phrases_string = "";

            npc_choices_map.get(last_character).forEach(function (kaya_phrase) {
                // GET LAST CHARACTER OF KAYA'S OPTION AND SEE IF THE USER CAN GET SOMETHING OUT OF IT
                let lc = get_last_character(kaya_phrase.split(';')[1]);
                let missing_phrases = missing_phrase_map.get(lc);

                // CHECK STATUS
                if (kaya_new_phrases.includes(kaya_phrase)) {
                    kaya_can_select_new_phrase = true;
                    kaya_phrases_string += "  - " + kaya_phrase + "\n";
                }
                // if (missing_phrases = undefined)
                if (missing_phrases.length > 0) {
                    user_can_select_new_phrase = true;
                    user_phrases_string += "  - " + kaya_phrase + " -> (" + missing_phrases.length + " New Choices)\n";
                }
                if ((kaya_new_phrases.includes(kaya_phrase) && missing_phrases.length > 0)) {
                    kaya_and_user_can_select_new_phrases = true;
                    kaya_and_user_phrases_string += "  - " + kaya_phrase + " -> (" + missing_phrases.length + " New Choices)\n";
                }
            });

            // ASSIGN APPROPRIATE COLOR DEPENDING ON RESULT
            if (kaya_and_user_can_select_new_phrases) {
                color_highlight = word_list_keys.priconneyomi + " ";
            } else if (kaya_can_select_new_phrase) {
                color_highlight = word_list_keys.futsuyomi + " ";
            } else if (user_can_select_new_phrase) {
                color_highlight = word_list_keys.urayomi + " ";
            }

            // ADDITIONAL TITLE TEXT
            additional_title_text += (kaya_can_select_new_phrase ? "\nKaya has a chance of choosing a new phrase!\n" + kaya_phrases_string : "") +
                (user_can_select_new_phrase ? "\nPlayer has a chance of choosing a new phrase!\n" + user_phrases_string : "") +
                (kaya_and_user_can_select_new_phrases ? "\nKaya and Player has a chance of choosing new phrases!\n" + kaya_and_user_phrases_string : "");
        }

        //console.log(phrase + "\n" + additional_title_text);

        // INSERT DATA
        table_html += "<th class='word-image'>";
        table_html += "<button id='" + word_id + "_" + phrase + "' class='pointer-cursor word-selection-button" + (is_word_already_collected ? " low-opacity" : "") + "' onclick='shiritori(\"" + word_id + "\", \"" + phrase + "\", \"" + phrase_type + "\")'>";
        table_html += "<img class='notranslate " + color_highlight + phrase_highlight + " word-image' title='" + phrase + "\n" + additional_title_text + "' src='images/game/" + word_id + ".png' alt=''>";
        table_html += "<img class='notranslate " + phrase_highlight + "character-circle' src='images/webpage/" + "character_circle" + ".png' alt=''>";
        table_html += "<div class='notranslate end-character webpage-text " + phrase_type + "'>" + get_last_character(phrase) + "</div>";
        table_html += "</button></th>";

        counter++;
    }
}

function reset_game() {
    shiritori_game.rush_mode = false;
    if (!document.getElementById("rush-mode-button").classList.contains("low-opacity")) {
        document.getElementById("rush-mode-button").classList.toggle("low-opacity");
    }
    shiritori_game.turn_count = 0;
    shiritori_game.last_phrase_played = '';
    shiritori_game.new_phrase_collected = false;
    document.getElementById("turn-text").hidden = true;
    document.getElementById("game-start-tip").hidden = false;
    document.getElementById("your-turn-text").hidden = true;
    document.getElementById("opponent-turn-text").hidden = true;
    document.getElementById("rush-mode-button-text").hidden = true;
    document.getElementById("rush-mode-text").hidden = true;
    document.getElementById("n-character-hit-text").hidden = true;
    document.getElementById("latest-selection").hidden = true;
    document.getElementById("undo-button").disabled = true;
    document.getElementById("word-list-contents").hidden = false;
    document.getElementById("word-list-hidden-warning").hidden = true;
    document.getElementById("undo-button").hidden = true;

    build_all_choices();

    console.log(get_colored_message(shiritori_game.sender_name, "Shiritori game has been reset.", message_status.INFO));

}

function print_word_list() {
    let phrase_counter = 0;
    let futsuyomi_counter = 0;
    let urayomi_counter = 0;
    let priconneyomi_counter = 0;

    console.log("word list size: " + highlight_code(word_list.size));
    for (let [word_id, word_data] of word_list) {
        console.log(highlight_code("word id") + ": " + highlight(word_id));
        if (word_data.get(word_list_keys.futsuyomi).length > 0) {
            console.log("\t" + highlight_code(word_list_keys.futsuyomi) + ":");
            for (let i = 0; i < word_data.get(word_list_keys.futsuyomi).length; i++) {
                console.log("\t\t" + color_text(word_data.get(word_list_keys.futsuyomi)[i], console_colors.GREEN));
                phrase_counter++;
                futsuyomi_counter++;
            }
        }
        if (word_data.get(word_list_keys.urayomi).length > 0) {
            console.log("\t" + highlight_code(word_list_keys.urayomi) + ":");
            for (let i = 0; i < word_data.get(word_list_keys.urayomi).length; i++) {
                console.log("\t\t" + color_text(word_data.get(word_list_keys.urayomi)[i], console_colors.CYAN));
                phrase_counter++;
                urayomi_counter++;
            }
        }
        if (word_data.get(word_list_keys.priconneyomi).length > 0) {
            console.log("\t" + highlight_code(word_list_keys.priconneyomi) + ":");
            for (let i = 0; i < word_data.get(word_list_keys.priconneyomi).length; i++) {
                console.log("\t\t" + color_text(word_data.get(word_list_keys.priconneyomi)[i], console_colors.MAGENTA));
                phrase_counter++;
                priconneyomi_counter++;
            }
        }
    }
    console.log(highlight_code(phrase_counter) + " phrases counted.");
    console.log(highlight(word_list_keys.futsuyomi) + ": " + highlight_code(futsuyomi_counter));
    console.log(highlight(word_list_keys.urayomi) + ": " + highlight_code(urayomi_counter));
    console.log(highlight(word_list_keys.priconneyomi) + ": " + highlight_code(priconneyomi_counter));
}

function build_all_choices() {
    let table_html = "";
    let counter = 0;
    let last_word_id = "";

    for (let [word_id, word_data] of word_list) {
        // COLLECT POSSIBLE PHRASES FROM WORD
        let words = [];
        for (let i = 0; i < word_data.get(word_list_keys.futsuyomi).length; i++) {
            words.push({
                [word_data.get(word_list_keys.futsuyomi)[i]]: word_list_keys.futsuyomi
            });
        }
        for (let i = 0; i < word_data.get(word_list_keys.urayomi).length; i++) {
            words.push({
                [word_data.get(word_list_keys.urayomi)[i]]: word_list_keys.urayomi
            });
        }
        for (let i = 0; i < word_data.get(word_list_keys.priconneyomi).length; i++) {
            words.push({
                [word_data.get(word_list_keys.priconneyomi)[i]]: word_list_keys.priconneyomi
            });
        }

        for (let i = 0; i < words.length; i++) {
            // (word_id, {phrase : phrase_type})
            // phrase_type = futsuyomi | urayomi | priconneyomi ; determine color of character
            // BLACKLIST ANY PRICONNEYOMI WORDS SINCE THEY WILL NEVER BE SELECTED BY KAYA
            // ALSO BLACKLIST ANY URAYOMI WORDS SINCE THEY WILL NEVER BE SELECTED BY KAYA AT THE START
            // ~~ALSO BLACKLIST ANY FUTSUYOMI WORDS THAT AREN'T THE FIRST ONE~~
            //   4/30/2021: SEEMS THE ABOVE COMMENT ISN'T THE CASE ANYMORE!!!
            // ALSO BLACKLIST ANY FUTSUYOMI WORDS THAT END WITH -
            if (words[i][Object.keys(words[i])[0]] !== word_list_keys.priconneyomi &&
                words[i][Object.keys(words[i])[0]] !== word_list_keys.urayomi &&
                word_id !== last_word_id) {
                // last_word_id = word_id;
                if (get_last_character(Object.keys(words[i])[0]) !== "-") {
                    add_word_to_table_html(word_id, words[i]);
                }
            }
        }
    }
    // CLOSE TABLE
    table_html += "</tr></tbody>";
    document.getElementById("selection-table").innerHTML = table_html;

    function add_word_to_table_html(word_id, phrase_data) {
        // ADD TABLE ROW IF FIRST WORD
        if (counter === 0) {
            table_html += "<tr class='border'>";
        }

        // CLOSE TABLE ROW AND START NEW IF LIMIT HAS BEEN REACHED
        if (counter % shiritori_game.max_words_per_row === 0 && counter !== 0) {
            table_html += "</tr><tr>";
        }

        let phrase = Object.keys(phrase_data)[0];
        let phrase_type = phrase_data[phrase];
        let is_word_already_collected = shiritori_game.collected_words.includes(word_id + ";" + phrase + ";" + phrase_type);

        // INSERT DATA
        table_html += "<th class='word-image' style='width: 100px;'>";
        table_html += "<button id='" + word_id + "_" + phrase + "' class='pointer-cursor word-selection-button" + (is_word_already_collected ? " low-opacity" : "") + "' onclick='shiritori(\"" + word_id + "\", \"" + phrase + "\", \"" + phrase_type + "\")'>";
        table_html += "<img class='notranslate word-image' title='" + phrase + "' src='images/game/" + word_id + ".png' alt=''>";
        table_html += "<img class='notranslate character-circle' src='images/webpage/" + "character_circle" + ".png' alt=''>";
        table_html += "<div class='notranslate end-character webpage-text " + phrase_type + "'>" + get_last_character(phrase) + "</div>";
        table_html += "</button><span class='notranslate starting-phrase'>" + phrase + "</span></th>";

        counter++;
    }
}

function get_last_character(phrase) {
    var vowel_list = ["ะ", "า", "ิ", "ี", "ึ", "ื", "ุ", "ู", "เ", "แ", "โ", "ไ", "ใ", "ฤ", "ๅ", "ำ", "ๆ", "ฯ", "่", "้", "๊", "๋", "็", "์"];

    let last_character = phrase[phrase.length - 1];

    if (vowel_list.indexOf(last_character) > -1) {
        last_character = phrase[phrase.length - 2];
        if (vowel_list.indexOf(last_character) > -1) {
            last_character = phrase[phrase.length - 3];
            if (vowel_list.indexOf(last_character) > -1) {
                last_character = phrase[phrase.length - 4];
            }
        }
    }

    if (last_character === "ศ") {
        last_character = "-";
    }
    if (last_character === "ญ") {
        last_character = "-";
    }
    if (last_character === "ณ") {
        last_character = "-";
    }
    if (last_character === "ษ") {
        last_character = "-";
    }

    return last_character;
}

function get_first_character(phrase) {
    var vowel_list = ["ะ", "า", "ิ", "ี", "ึ", "ื", "ุ", "ู", "เ", "แ", "โ", "ไ", "ใ", "ฤ", "ๅ", "ำ", "ๆ", "ฯ", "่", "้", "๊", "๋", "็", "์"];

    let first_character = phrase[0];

    if (vowel_list.indexOf(first_character) > -1) {
        first_character = phrase[1];
        if (vowel_list.indexOf(first_character) > -1) {
            first_character = phrase[2];
        }
    }

    return first_character;
}

function toggle_rush_mode() {
    shiritori_game.rush_mode = !shiritori_game.rush_mode;
    document.getElementById("rush-mode-button").classList.toggle("low-opacity");
    console.log(get_colored_message(shiritori_game.sender_name, "Rush Mode = " + shiritori_game.rush_mode, message_status.INFO));

    if (shiritori_game.rush_mode) {
        document.getElementById("opponent-turn-text").hidden = true;
        document.getElementById("rush-mode-text").hidden = false;
    } else {
        document.getElementById("opponent-turn-text").hidden = false;
        document.getElementById("rush-mode-text").hidden = true;
    }

    // DISABLE UNDO BUTTON
    document.getElementById("undo-button").disabled = true;
}

function build_word_list() {
    let html = "";
    for (let [word_id, word_data] of word_list) {
        let futsuyomi_array = word_data.get(word_list_keys.futsuyomi);
        let urayomi_array = word_data.get(word_list_keys.urayomi);
        let priconneyomi_array = word_data.get(word_list_keys.priconneyomi);

        // ADD AMOUNT TO TOTAL
        shiritori_game.futsuyomi_total_phrases += futsuyomi_array.length;
        shiritori_game.urayomi_total_phrases += urayomi_array.length;
        shiritori_game.priconneyomi_total_phrases += priconneyomi_array.length;

        // WORD IMAGE
        html += "<img class='word-list-image' title='" + word_id + "' src='images/game/" + word_id + ".png' alt=''>";

        // DIVIDER
        html += "<img class='divider' src='' alt=''>";

        // COMPLETE IMAGE/TEXT
        html += "<img id='" + word_id + "-complete' class='complete' src='images/webpage/" + "complete" + ".png' alt='' hidden>";

        // FUTSUYOMI PHRASES
        if (futsuyomi_array.length > 0) {
            html += "<br>";
            for (let i = 0; i < futsuyomi_array.length; i++) {
                html += "<button id='" + word_id + "-" + futsuyomi_array[i] + "' onclick='toggle_phrase(\"" + word_id + "\", \"" + futsuyomi_array[i] + "\", \"futsuyomi\");'>";
                html += "<div class='futsuyomi word-list-text' style='font-weight: bolder'>" + futsuyomi_array[i] + "</div>";
                html += "</button><br>";
            }
        }

        // URAYOMI PHRASES
        if (urayomi_array.length > 0) {
            for (let i = 0; i < urayomi_array.length; i++) {
                html += "<button id='" + word_id + "-" + urayomi_array[i] + "' onclick='toggle_phrase(\"" + word_id + "\", \"" + urayomi_array[i] + "\", \"urayomi\")'>";
                html += "<div class='urayomi word-list-text' style='font-weight: bolder'>" + urayomi_array[i] + "</div>";
                html += "</button><br>";
            }
        }

        // PRICONNEYOMI PHRASES
        if (priconneyomi_array.length > 0) {
            for (let i = 0; i < priconneyomi_array.length; i++) {
                html += "<button id='" + word_id + "-" + priconneyomi_array[i] + "' onclick='toggle_phrase(\"" + word_id + "\", \"" + priconneyomi_array[i] + "\", \"priconneyomi\")'>";
                html += "<div class='priconneyomi word-list-text' style='font-weight: bolder'>" + priconneyomi_array[i] + "</div>";
                html += "</button><br>";
            }
            html += "<br>";
        }
        html += "</tbody></table><br><br><br>";
    }
    document.getElementById("word-list").innerHTML = html;

    // SET TOTAL PHRASES
    document.getElementById("futsuyomi-total-count").innerHTML = shiritori_game.futsuyomi_total_phrases;
    document.getElementById("urayomi-total-count").innerHTML = shiritori_game.urayomi_total_phrases;
    document.getElementById("priconneyomi-total-count").innerHTML = shiritori_game.priconneyomi_total_phrases;
}

function toggle_phrase(word_id, phrase, phrase_type) {
    let word = word_id + ";" + phrase + ";" + phrase_type;
    if (shiritori_game.collected_words.includes(word)) {
        remove_word_from_collection(word_id, phrase, phrase_type);
    } else {
        add_word_to_collection(word_id, phrase, phrase_type);
    }

    if (shiritori_game.turn_count === 0) {
        shiritori_game.unsaved_changes = true;
    }
}

function check_if_word_complete(word_id) {
    let word_data = word_list.get(word_id);
    let merged_array = [...word_data.get(word_list_keys.futsuyomi), ...word_data.get(word_list_keys.urayomi), ...word_data.get(word_list_keys.priconneyomi)];

    for (let i = 0; i < merged_array.length; i++) {
        if (!document.getElementById(word_id + "-" + merged_array[i]).classList.contains("low-opacity")) {
            document.getElementById(word_id + "-complete").hidden = true;
            return false;
        }
    }
    document.getElementById(word_id + "-complete").hidden = false;
    return true;
}

function select_invert_phrase() {
    if (window.confirm("ต้องการเลือกการ์ดคำตรงข้ามหรือไม่?\nการเลือกการ์ดทั้งหมด ให้ทำการ 'Reset Data' ให้คำทั้งหมด เป็น 0.")) {

        var buttons = document.getElementsByClassName('word-list-text');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].click();
        }
    }
}

function reset_data() {
    if (localStorage.getItem(shiritori_game.localstorage_location) !== null) {
        if (window.confirm("คุณต้องการ Reset ข้อมูลทั้งหมดหรือไม่?\nหากทำการรีเซ็ต ข้อมูลการเล่นทั้งหมดจะหายไป")) {
            localStorage.removeItem(shiritori_game.localstorage_location);
            location.reload();
        }
    }
}