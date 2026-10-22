
export function validateERSchema(input: any) {
    const errors: string[] = [];

    if (!input || typeof input !== "object") {
        errors.push("Lo schema deve essere un oggetto JSON.");
        return errors;
    }

    if (!input.schema?.entities || !Array.isArray(input.schema.entities)) {
        errors.push("schema.entities deve essere un array.");
    }

    if (!input.schema?.relationships || !Array.isArray(input.schema.relationships)) {
        errors.push("schema.relationships deve essere un array.");
    }

    const entities = input.schema?.entities ?? [];
    const entityNames = new Set();

    for (const entity of entities) {
        if (!entity.name) errors.push("Ogni entità deve avere name.");
        if (entityNames.has(entity.name)) {
            errors.push(`Entità duplicata: ${entity.name}`);
        }
        entityNames.add(entity.name);

        if (!Array.isArray(entity.attributes)) {
            errors.push(`attributes mancante/non valido per ${entity.name}.`);
            continue;
        }

        const attrs = new Set();
        for (const attr of entity.attributes) {
            if (!attr.name) errors.push(`Attributo senza name in ${entity.name}.`);
            if (attrs.has(attr.name)) {
                errors.push(`Attributo duplicato ${entity.name}.${attr.name}`);
            }
            attrs.add(attr.name);

            if (!attr.type) errors.push(`Tipo mancante per ${entity.name}.${attr.name}.`);
            if (!attr.cardinality) {
                errors.push(`Cardinalità mancante per ${entity.name}.${attr.name}.`);
            }
        }

        if (!Array.isArray(entity.identifier) || entity.identifier.length === 0) {
            errors.push(`L'entità ${entity.name} deve avere almeno un identifier.`);
        }
    }

    const relationshipNames = new Set();
    for (const rel of input.schema?.relationships ?? []) {
        if (!rel.name) errors.push("Relazione senza name.");
        if (relationshipNames.has(rel.name)) {
            errors.push(`Relazione duplicata: ${rel.name}`);
        }
        relationshipNames.add(rel.name);

        if (!Array.isArray(rel.sides) || rel.sides.length !== 2) {
            errors.push(`La relazione ${rel.name} deve avere esattamente due sides.`);
            continue;
        }

        for (const side of rel.sides) {
            if (!entityNames.has(side.entity)) {
                errors.push(`La relazione ${rel.name} cita entità inesistente: ${side.entity}`);
            }
        }
    }

    for (const encapsulation of input.labeling?.encapsulations) {
        if (!entityNames.has(encapsulation.into)) {
            errors.push(`L'entità into "${encapsulation.into}" in encapsulations deve esistere.`);
        }
        if (!entityNames.has(encapsulation.entity)) {
            errors.push(`L'entità entity "${encapsulation.entity}" in encapsulations deve esistere.`);
        }
        if (!relationshipNames.has(encapsulation.relationship)) {
            errors.push(`La relazione "${encapsulation.relationship}" in encapsulations deve esistere.`);
        }
    }

    for (const main of input.labeling?.main_entities ?? []) {
        if (!entityNames.has(main.entity)) {
            errors.push(`main_entity riferisce entità inesistente: ${main.entity}`);
        }
    }

    for (const reference of input.labeling?.references) {
        if (!relationshipNames.has(reference.relationship)) {
            errors.push(`La relazione ${reference.relationship} in references deve esistere.`)
        }
        if (!entityNames.has(reference.stored_in)) {
            errors.push(`L'entità stored_in "${reference.stored_in}" in references deve esistere.`);
        }
        if (!entityNames.has(reference.target)) {
            errors.push(`L'entità target "${reference.target}" in references deve esistere.`);
        }
        if (reference.label !== "id" && reference.label !== "key") {
            errors.push(`L'attributo label di reference deve essere "id" o "key". "${reference.label}" non valido.`);
        }
    }

    return errors;
}
