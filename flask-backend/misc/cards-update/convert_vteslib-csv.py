import csv
import re
import json
import unicodedata


def letters_to_ascii(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text)
                   if unicodedata.category(c) != 'Mn')


artist_fixes = {
    "Alejandro Collucci": "Alejandro Colucci",
    "Chet Masterz": "Chet Masters",
    "Dimple": "Nicolas Bigot",
    "EM Gist": "Erik Gist",
    "G. Goleash": "Grant Goleash",
    "Gin\u00e9s Qui\u00f1onero-Santiago": "Gin\u00e9s Qui\u00f1onero",
    "Glenn Osterberger": "Glen Osterberger",
    "Heather V. Kreiter": "Heather Kreiter",
    "Jeff \"el jefe\" Holt": "Jeff Holt",
    "L. Snelly": "Lawrence Snelly",
    "Mathias Tapia": "Matias Tapia",
    "Mattias Tapia": "Matias Tapia",
    "Matt Mitchell": "Matthew Mitchell",
    "Mike Gaydos": "Michael Gaydos",
    "Mike Weaver": "Michael Weaver",
    "Nicolas \"Dimple\" Bigot": "Nicolas Bigot",
    "Pat McEvoy": "Patrick McEvoy",
    "Ron Spenser": "Ron Spencer",
    "Sam Araya": "Samuel Araya",
    "Sandra Chang": "Sandra Chang-Adair",
    "T. Bradstreet": "Tim Bradstreet",
    "Tom Baxa": "Thomas Baxa",
    "zelgaris": "Tomáš Zahradníček",
}

integer_fields = ['Id']
useless_fields = ['Aka', 'Flavor Text', 'Draft']

with open("vteslib.csv", "r", encoding='utf8') as f_csv, open(
        "vteslib.json", "w", encoding='utf8') as cardbase_backend_file, open(
            "cardbase_lib.json", "w",
            encoding='utf8') as cardbase_frontend_file, open(
                "vtes.json", "r", encoding='utf8') as krcg_file, open(
                    "artistsLib.json", "w",
                    encoding='utf8') as artists_file, open(
                        "../../twda.json", "r") as twda_input:

    krcg_cards = json.load(krcg_file)
    reader = csv.reader(f_csv)
    fieldnames = next(reader)
    csv_cards = csv.DictReader(f_csv, fieldnames)
    cards_backend = []
    cards_frontend = {}
    artistsSet = set()
    twda = json.load(twda_input)

    for card in csv_cards:

        # Convert some fields values to integers
        for k in integer_fields:
            try:
                card[k] = int(card[k])
            except (ValueError):
                pass

        # ASCII-fication of name
        if card['Id'] == 101670:
            card['ASCII Name'] = "Sacre-Coeur Cathedral, France"
        elif card['Id'] == 100130:
            card['ASCII Name'] = "Bang Nakh - Tiger's Claws"
        else:
            card['ASCII Name'] = letters_to_ascii(card['Name'])

        # Convert sets to dict
        sets = card['Set'].split(', ')
        card['Set'] = {}
        for set in sets:
            if ':' in set:
                set = set.split(':')
            elif '-' in set:
                set = set.split('-')

            card['Set'][set[0]] = {}

            precons = set[1].split('/')

            # Fix for KoT & HttB Reprints (marked in CSV as KoT, but have only bundles named "A" or "B" not existing in original KoT)
            if set[0] in ["KoT", "HttB"]:
                counter = 0
                for precon in precons:
                    if re.match(r'(A|B)[0-9]?', precon):
                        counter += 1

                if counter > 0:
                    card['Set'][f"{set[0]}R"] = {}
                if counter < len(precons):
                    card['Set'][set[0]] = {}

            elif set[0] not in card['Set']:
                card['Set'][set[0]] = {}

            for precon in precons:
                if set[0] in ["KoT", "HttB"] and (m := re.match(
                        r'^(A|B)([0-9]+)?', precon)):
                    s = f"{set[0]}R"
                    if m.group(2):
                        card['Set'][s][m.group(1)] = m.group(2)
                    else:
                        card['Set'][s][m.group(1)] = 1

                else:
                    if m := re.match(r'^(\D+)([0-9]+)?', precon):
                        if m.group(1) in ["C", "U", "R", "V", "DTC", "Promo"]:
                            card['Set'][set[0]][m.group(1)] = True
                        elif m.group(2):
                            card['Set'][set[0]][m.group(1)] = m.group(2)
                        else:
                            card['Set'][set[0]][m.group(1)] = 1
                    elif m := re.match(r'^[0-9]$', precon):
                        card['Set'][set[0]][""] = precon
                    else:
                        card['Set'][set[0]][precon] = True

        # Remove useless fields
        for k in useless_fields:
            del card[k]

        artists = []
        for artist in re.split('; | & ', card['Artist']):
            if artist in artist_fixes.keys():
                artists.append(artist_fixes[artist])
                artistsSet.add(artist_fixes[artist])
            else:
                artists.append(artist)
                artistsSet.add(artist)

        card['Artist'] = artists

        # Remove {} and spaces in []
        card['Card Text'] = re.sub('[{}]', '', card['Card Text'])
        card['Card Text'] = re.sub(r'\[(\w+)\s*(\w*)\]', r'[\1\2]',
                                   card['Card Text'])

        # Add rules to card
        card['Rulings'] = []
        for c in krcg_cards:
            if c['id'] == card['Id'] and 'rulings' in c:
                for rule in c['rulings']['text']:
                    if match := re.match(r'(.*?)\[... \S+\].*', rule):
                        text = match.group(1)
                        text = re.sub(r'{The (\w+)}', r'{\1, The}', text)
                        card['Rulings'].append({
                            'text': text,
                            'refs': {},
                        })

                for id in c['rulings']['links'].keys():
                    for i, rule in enumerate(c['rulings']['text']):
                        if id in rule:
                            card['Rulings'][i]['refs'][id] = c['rulings'][
                                'links'][id]

        # Add twda info
        card['Twd'] = False
        for i in twda:
            if card['Twd']:
                continue

            for cardtype in i['library']['cards']:
                for c in cardtype['cards']:
                    if c['id'] == card['Id']:
                        card['Twd'] = True

        # Prepare for export
        cards_frontend[card['Id']] = {
            'Id': card['Id'],
            'Name': card['Name'],
            'Type': card['Type'],
            'Clan': card['Clan'],
            'Discipline': card['Discipline'],
            'Blood Cost': card['Blood Cost'],
            'Pool Cost': card['Pool Cost'],
            'Conviction Cost': card['Conviction Cost'],
            'Burn Option': card['Burn Option'],
            'Card Text': card['Card Text'],
            'Set': card['Set'],
            'Requirement': card['Requirement'],
            'Banned': card['Banned'],
            'Artist': card['Artist'],
            'Rulings': card['Rulings'],
            'ASCII Name': card['ASCII Name'],
        }

        card_backend = {
            'Id': card['Id'],
            'Name': card['Name'],
            'Type': card['Type'],
            'Clan': card['Clan'],
            'Discipline': card['Discipline'],
            'Blood Cost': card['Blood Cost'],
            'Pool Cost': card['Pool Cost'],
            'Conviction Cost': card['Conviction Cost'],
            'Burn Option': card['Burn Option'],
            'Card Text': card['Card Text'],
            'Set': card['Set'],
            'Requirement': card['Requirement'],
            'Banned': card['Banned'],
            'Artist': card['Artist'],
            'Rulings': card['Rulings'],
            'ASCII Name': card['ASCII Name'],
            'Twd': card['Twd'],
        }

        cards_backend.append(card_backend)

    artists = sorted(artistsSet)

    # json.dump(cards, f_json, separators=(',', ':'))
    # Use this instead, for output with indentation (e.g. for debug)
    json.dump(cards_backend,
              cardbase_backend_file,
              indent=4,
              separators=(',', ':'))
    json.dump(cards_frontend,
              cardbase_frontend_file,
              indent=4,
              separators=(',', ':'))
    json.dump(artists, artists_file, indent=4, separators=(',', ':'))
