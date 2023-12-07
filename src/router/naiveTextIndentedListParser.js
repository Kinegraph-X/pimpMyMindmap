
const testData = `Développement Durable
    Économie durable
        Énergies renouvelables
        Économie circulaire
        Responsabilité sociale des entreprises (RSE)
        Commerce équitable
    Social
        Éducation
        Santé
        Égalité des genres
        Lutte contre la pauvreté
    Environnement
        Conservation de la biodiversité
        Gestion des déchets
        Changement climatique
        Utilisation durable des ressources naturelles
            Énergies Renouvelables
                Solaire
                Éolien
                Hydroélectrique
                Géothermique
            Économie Circulaire
                Recyclage
                Réutilisation
                Réduction des déchets
            Responsabilité Sociale des Entreprises (RSE)
                Éthique des affaires
                Implication communautaire
                Transparence
            Éducation
                Sensibilisation
                Formation professionnelle
                Éducation environnementale
            Santé
                Accès aux soins de santé
                Sécurité alimentaire
                Santé mentale
        Conservation de la Biodiversité
            Protection des espèces en voie de disparition
            Préservation des écosystèmes
`


/**
 * @constructor naiveTextIndentedListParser
 * @param {String} textContent
 */
const naiveTextIndentedListParser = function(textContent) {
	this.lines = textContent.split('\n');
	this.indentingChar = '';
	this.currentLineIdx = 1;
	this.result = new Result(this.lines[0]);
	this.detectIndentingChar();
	this.parse(1, this.result);
}

naiveTextIndentedListParser.prototype.detectIndentingChar = function() {
	let char = this.lines[1].slice(0, 1);
	
	if (char === ' ') {
		for (let i = 0, l = this.lines[1].length; i < l; i++) {
			char = this.lines[1].slice(i, i + 1);
			if (char !== ' ')
				break;
			else
				this.indentingChar += char;
		}
	}
	else
		this.indentingChar = char;
}

/**
 * @method parse
 * @param {Number} depth
 * @param {Result} result
 */
naiveTextIndentedListParser.prototype.parse = function(depth, result) {
	let splitted, currentDepth = 0, currentTopic = '';
	while (this.currentLineIdx < this.lines.length) {
		
		splitted = this.lines[this.currentLineIdx].split(this.indentingChar);
		currentDepth = splitted.length - 1;
		currentTopic = splitted[splitted.length - 1];
		
		if (currentDepth === depth) {
			result.children.push(new Result(currentTopic));
		}
		else if (currentDepth > depth) {
			this.parse(depth + 1, result.children[result.children.length - 1]);
		}
		else {
			this.currentLineIdx--;
			break;
		}
		this.currentLineIdx++;
	}
}


/**
 * @constructor Result
 * @param {String} topic
 */
const Result = function(topic) {
	this.topic = topic,
	/** @type {Result[]} */
	this.children = Array();
}




module.exports = naiveTextIndentedListParser;