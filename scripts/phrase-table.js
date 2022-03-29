let _phrase_table_js = {
    sender_name: 'Phrase Table',

    class_header: 'phraseTable-',

    table_visible: false,
    word_searched: '',
};

function create_table(desired_word)
{
    if (desired_word === "")
    {
        return;
    }

    console.log(get_colored_message(_phrase_table_js.sender_name, "Building phrase table for " + desired_word, message_status.INFO));
    _phrase_table_js.word_searched = desired_word;

    // SHOW TREE IF NOT VISIBLE
    if (!_phrase_table_js.table_visible)
    {
        document.getElementById("phrase-table-div").hidden = false;
        document.getElementById("word-search-table").hidden = true;
        _phrase_table_js.table_visible = true;
    }

    // TREE CONFIG
    let chart_config = {
        chart: {
            container: "#tree-simple",
            rootOrientation: 'EAST',
            connectors: {
                type: 'step'
            },
            node: {
                HTMLclass: 'phraseTree'
            }
        },
        nodeStructure: {
            text: {
                name: "",               // DESIRED WORD HERE
                last_character: "",     // LAST CHARACTER IN HIRAGANA HERE
            },
            HTMLclass: 'desiredWord',
            image: "",                  // DESIRED WORD IMAGE HERE
            children: []
        }
    };

    let phrase_counter = 0;
    if (!document.getElementById("result-search-checkbox").checked)
    {
        let dw_data = desired_word.split(';');
        let dw_fc = get_first_character(dw_data[1]);

        // INSERT INFO FROM DESIRED WORD INTO TREE (NAME / IMAGE / CLASS)
        chart_config["nodeStructure"]["text"]["name"] = dw_data[1] + " [" + get_last_character(dw_data[1]) + "]";
        chart_config["nodeStructure"]["image"] = "images/game/" + dw_data[0] + ".png";
        chart_config["nodeStructure"]["HTMLclass"] += " " + dw_data[2];

        // FIND POSSIBLE WORDS THAT CAN LEAD TO DESIRED WORD
        let array_of_words_that_end_with_first_char = reverse_result_map.get(dw_fc);
        array_of_words_that_end_with_first_char.forEach(function (w)
        {
            let w_data = w.split(';');

            // BUILD TREE OBJECT
            let phrase_map = {};
            phrase_map["HTMLclass"] = _phrase_table_js.class_header + phrase_counter + " " + w_data[2];
            phrase_map["text"] = {"name" : w_data[1] + " [" + get_last_character(w_data[1]) + "]"};
            phrase_map["image"] = "images/game/" + w_data[0] + ".png";

            // ADD OBJECT TO TREE CHILDREN
            chart_config["nodeStructure"]["children"].push(phrase_map);

            // INCREMENT COUNTER
            phrase_counter++;
        });

        // CONSTRUCT TREE
        construct_tree(array_of_words_that_end_with_first_char);
    }
    else
    {
        // FLIP CHART
        chart_config["chart"]["rootOrientation"] = "WEST";

        // GET DATA
        let dw_data = desired_word.split(';');
        let dw_lc = get_last_character(dw_data[1]);

        // INSERT INFO FROM DESIRED WORD INTO TREE (NAME / IMAGE / CLASS)
        chart_config["nodeStructure"]["text"]["name"] = dw_data[1] + " [" + get_last_character(dw_data[1]) + "]";
        chart_config["nodeStructure"]["image"] = "images/game/" + dw_data[0] + ".png";
        chart_config["nodeStructure"]["HTMLclass"] += " " + dw_data[2];

        // FIND POSSIBLE WORDS DESIRED WORD CAN MAKE
        let array_of_words_that_begin_with_last_character = result_map.get(dw_lc);
        array_of_words_that_begin_with_last_character.forEach(function (w)
        {
            let w_data = w.split(';');

            // BUILD TREE OBJECT
            let phrase_map = {};
            phrase_map["HTMLclass"] = _phrase_table_js.class_header + phrase_counter + " " + w_data[2];
            phrase_map["text"] = {"name" : w_data[1] + " [" + get_last_character(w_data[1]) + "]"};
            phrase_map["image"] = "images/game/" + w_data[0] + ".png";

            // ADD OBJECT TO TREE CHILDREN
            chart_config["nodeStructure"]["children"].push(phrase_map);

            // INCREMENT COUNTER
            phrase_counter++;
        });

        // CONSTRUCT TREE
        construct_tree(array_of_words_that_begin_with_last_character);
    }

    function construct_tree(array_of_children)
    {
        // CONSTRUCT TREE
        phrase_counter = 0;
        new Treant(chart_config, function () {
            // GO THROUGH ARRAY AND ADD DIV FUNCTIONALITY
            array_of_children.forEach(function (w)
            {
                // GET CHILD DIV
                let phrase_div = document.getElementsByClassName(_phrase_table_js.class_header + phrase_counter)[0];

                // ADD FUNCTIONALITY TO DIV
                phrase_div.style.cursor = 'pointer';
                phrase_div.onclick = function ()
                {
                    create_table(w);
                };

                // INCREMENT COUNTER
                phrase_counter++;
            });
        }, $);

        document.getElementById("reset-word-search-button").hidden = false;
    }
}

function reset_word_search()
{
    document.getElementById("phrase-table-div").hidden = true;
    document.getElementById("word-search-table").hidden = false;
    document.getElementById("reset-word-search-button").hidden = true;
    _phrase_table_js.table_visible = false;
    _phrase_table_js.word_searched = '';
}

function build_phrase_list()
{
    let table_html = "";
    let counter = 0;

    let low_opacity_enabled = document.getElementById("low-opacity-word-search-checkbox").checked;

    for (let [word_id, word_data] of word_list)
    {
        // COLLECT POSSIBLE PHRASES FROM WORD
        let words = [];
        for (let i = 0 ; i < word_data.get(word_list_keys.futsuyomi).length ; i++)
        {
            words.push({ [word_data.get(word_list_keys.futsuyomi)[i]] : word_list_keys.futsuyomi });
        }
        for (let i = 0 ; i < word_data.get(word_list_keys.urayomi).length ; i++)
        {
            words.push({ [word_data.get(word_list_keys.urayomi)[i]] : word_list_keys.urayomi });
        }
        for (let i = 0 ; i < word_data.get(word_list_keys.priconneyomi).length ; i++)
        {
            words.push({ [word_data.get(word_list_keys.priconneyomi)[i]] : word_list_keys.priconneyomi });
        }

        for (let i = 0 ; i < words.length ; i++)
        {
            // (word_id, {phrase : phrase_type})
            // phrase_type = futsuyomi | urayomi | priconneyomi ; determine color of character
            add_word_to_table_html(word_id, words[i]);
        }
    }
    // CLOSE TABLE
    table_html += "</tr></tbody>";
    document.getElementById("word-search-table").innerHTML = table_html;

    function add_word_to_table_html(word_id, phrase_data)
    {
        // ADD TABLE ROW IF FIRST WORD
        if (counter === 0)
        {
            table_html += "<tr class='border'>";
        }

        // CLOSE TABLE ROW AND START NEW IF LIMIT HAS BEEN REACHED
        if (counter % shiritori_game.max_words_per_row === 0 && counter !== 0)
        {
            table_html += "</tr><tr>";
        }

        let phrase = Object.keys(phrase_data)[0];
        let phrase_type = phrase_data[phrase];

        let low_opacity = "";
        if (shiritori_game.collected_words.includes(word_id + ";" + phrase + ";" + phrase_type) && low_opacity_enabled)
        {
            low_opacity = "low-opacity ";
        }

        // INSERT DATA
        table_html += "<th class='word-image'>";
        table_html += "<button id='" + word_id + "_" + phrase + "_word_search' class='pointer-cursor " + low_opacity + "word-selection-button' onclick='create_table(\"" + word_id + "\;" + phrase + "\;" + phrase_type + "\")'>";
        table_html += "<img class='notranslate word-image' title='" + phrase + "' src='images/game/" + word_id + ".png' alt=''>";
        table_html += "<img class='notranslate character-circle' src='images/webpage/" + "character_circle" + ".png' alt=''>";
        table_html += "<div class='notranslate end-character webpage-text " + phrase_type + "'>" + get_last_character(phrase) + "</div>";
        table_html += "</button></th>";

        counter++;
    }
}