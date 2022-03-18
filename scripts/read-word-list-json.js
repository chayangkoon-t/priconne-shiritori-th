const _read_word_list_js = Object.freeze({
    sender_name: 'Word List Reader'
});

// GLOBAL VARIABLES
let word_list = new Map();
let result_map = new Map();
let reverse_result_map = new Map();
let word_list_loaded = false;
const word_list_file = "word_list_blank.json";
const word_list_keys = Object.freeze({
    futsuyomi: 'futsuyomi',
    urayomi: 'urayomi',
    priconneyomi: 'priconneyomi',
});


let result_map_counter = 0;
let reverse_result_map_counter = 0;
// RUN AT STARTUP
read_word_list(function () {
    console.log(get_colored_message(_read_word_list_js.sender_name, "Word list loaded!", message_status.SUCCESS));
    word_list_loaded = true;

    // ADD ん TO RESULT MAP
    result_map.set("ん", []);
});

function print_result_map()
{
    for (let [character, phrase_array] of result_map)
    {
        console.log(character);
        phrase_array.forEach(function (phrase) {
            console.log("\t" + phrase);
        })
    }
}

function get_missing_phrase_map()
{
    let collection = shiritori_game.collected_words;
    let missing_phrase_map = new Map();
    result_map.forEach(function (phrase_array, character)
    {
        phrase_array = phrase_array.filter(n => !collection.includes(n));
        missing_phrase_map.set(character, phrase_array);
    });
    // ADD ん
    missing_phrase_map.set("ん", []);

    return missing_phrase_map;
}

function get_npc_choice_map()
{
    // JUST RETURN A MAP OF POSSIBLE NPC SELECTIONS, AKA FILTER OUT PRICONNEYOMI
    let npc_phrase_map = new Map();
    result_map.forEach(function (phrase_array, character)
    {
        phrase_array = phrase_array.filter(n => n.indexOf(word_list_keys.priconneyomi) < 0);
        npc_phrase_map.set(character, phrase_array);
    });
    // ADD ん
    npc_phrase_map.set("ん", []);

    return npc_phrase_map;
}

function read_word_list(callback)
{
    const file_path = "/" + window.location.pathname.substring(0, window.location.pathname.indexOf('/')) + window.location.pathname.split('/')[1] + "/data/" + word_list_file;
    console.log(get_colored_message(_read_word_list_js.sender_name, "Reading ", message_status.INFO) + highlight_code(file_path) + message_status.INFO + "...");

    return $(function () {
        $.ajax({
            'global': false,
            'url': file_path,
            'dataType': "json",
            'success': function (data) {
                $.when(
                    $.each(data, function(word, word_data)
                    {
                        // CONSTRUCT WORD MAP DATA
                        let word_map = new Map();
                        word_map.set(word_list_keys.futsuyomi, word_data[word_list_keys.futsuyomi]);
                        word_map.set(word_list_keys.urayomi, word_data[word_list_keys.urayomi]);
                        word_map.set(word_list_keys.priconneyomi, word_data[word_list_keys.priconneyomi]);

                        // ADD WORD TO WORD LIST
                        word_list.set(word, word_map);

                        // BUILD UP RESULT MAP
                        add_to_result_map(word, word_data[word_list_keys.futsuyomi], word_list_keys.futsuyomi);
                        add_to_result_map(word, word_data[word_list_keys.urayomi], word_list_keys.urayomi);
                        add_to_result_map(word, word_data[word_list_keys.priconneyomi], word_list_keys.priconneyomi);
                    })
                ).then(function () {
                    callback();
                });
            }
        });
    });

    function add_to_result_map(word_id, word_array, phrase_type)
    {
        word_array.forEach(function (phrase)
        {
            let first_character = wanakana.toHiragana(phrase[0]);
            let last_character = get_last_character(phrase);
            let word = word_id + ";" + phrase + ";" + phrase_type;

            if (!result_map.has(first_character))
            {
                // FIRST CHARACTER DOES NOT EXIST, CREATE NEW ENTRY
                let new_array = [];
                new_array.push(word);

                // ADD NEW DATA TO RESULT MAP
                result_map.set(first_character, new_array);

                result_map_counter++;
            }
            else
            {
                // FIRST CHARACTER ALREADY EXISTS, ADD TO EXISTING ARRAY
                let data_array = result_map.get(first_character);
                data_array.push(word);

                // OVERWRITE DATA TO RESULT MAP
                result_map.set(first_character, data_array);

                result_map_counter++;
            }

            // ALSO BUILD REVERSE RESULT MAP
            if (!reverse_result_map.has(last_character))
            {
                // LAST CHARACTER DOES NOT EXIST, CREATE NEW ENTRY
                let new_array = [];
                new_array.push(word);

                // ADD NEW DATA TO RESULT MAP
                reverse_result_map.set(last_character, new_array);

                reverse_result_map_counter++;
            }
            else
            {
                // LAST CHARACTER ALREADY EXISTS, ADD TO EXISTING ARRAY
                let data_array = reverse_result_map.get(last_character);
                data_array.push(word);

                // OVERWRITE DATA TO REVERSE RESULT MAP
                reverse_result_map.set(last_character, data_array);

                reverse_result_map_counter++;
            }
        });
    }
}