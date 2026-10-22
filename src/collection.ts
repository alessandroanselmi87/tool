
import { ObjectId } from 'mongodb';
import OpenAI from "openai";

export default class Collection {

    create(dati: any) {
        const map: any = {};
        console.log(`Costruisco una mappa di entità`);
        for (const entity of dati.schema.entities) {
            let obj: any = {};
            for (const attribute of entity.attributes) {
                // obj[attribute.name] = this.makeExampleValue(attribute);
                obj[attribute.name] = this.makeAttributeType(attribute);
            }
            map[entity.name] = obj;
        }
        console.log("Costruisco una collezione di documenti...");
        let collection = [];
        for (const main_entity of dati.labeling.main_entities) {
            console.log(`Costruisco il documento per ${main_entity.entity}`);
            let data = this.buildTree(main_entity.entity, dati, map, true);
            for (const reference of dati.labeling.references) {
                let _entity = dati.schema.entities.find((item: any) => item.name === reference.target);
                if (!_entity) {
                    throw new Error(`L'entità "${reference.target}" non trovata`);
                }
                let identifiers = _entity.attributes.filter((item: any) => _entity.identifier.includes(item.name));
                if (identifiers.length === 0) {
                    throw new Error(`Attributi non trovati per "${_entity.name}"`);
                }
                let item: any = {};
                if (reference.label === "id") {
                    identifiers[0].type = "integer";
                    // item[`${_entity.name}_id`] = this.makeExampleValue(identifiers[0]);
                    item[`${_entity.name}_id`] = this.makeAttributeType(identifiers[0]);
                } else if (reference.label === "key") {
                    for (const id of identifiers) {
                        // item[`${_entity.name}_${id.name}`] = this.makeExampleValue(id);
                        item[`${_entity.name}_${id.name}`] = this.makeAttributeType(id);
                    }
                }
                let relationship_attributes = dati.schema.relationships.find((item: any) => item.name === reference.relationship);
                for (const attribute of relationship_attributes.attributes) {
                    // item[attr.name] = this.makeExampleValue(attribute);
                    item[attribute.name] = this.makeAttributeType(attribute);
                }
                if (main_entity.entity === reference.stored_in) {
                    data[reference.relationship] = [item];
                }
            }
            const obj = {
                collection: main_entity.entity,
                document: data
            };
            collection.push(obj);
        }

        return collection;
    }

    buildTree(entity: string, dati: any, map: any, isFirst: boolean) {

        let node = {
            ...(isFirst ? { _id: new ObjectId() } : {}),
            ...map[entity]
        };

        isFirst = false;

        const children = dati.labeling.encapsulations.filter((item: any) => item.into === entity);

        for (const child of children) {
            let relationship = dati.schema.relationships.find((item: any) => item.name === child.relationship);
            let attributes_relationship: any = {};
            for (const attribute of relationship.attributes) {
                // attributes_relationship[attribute.name] = this.makeExampleValue(attribute);
                attributes_relationship[attribute.name] = this.makeAttributeType(attribute);
            }
            if (!node[child.relationship]) {
                node[child.relationship] = [{
                    [child.entity]: {},
                    ...attributes_relationship,
                }];
            }
            node[child.relationship][0][child.entity] = { ...this.buildTree(child.entity, dati, map, isFirst) };
        }

        return node;
    }

    cardinalityIsMany(cardinality: any) {
       return (cardinality?.max === "N" || Number(cardinality?.max) > 1);
    }

    makeAttributeType(attribute: any) {
        const many = this.cardinalityIsMany(attribute.cardinality);
        return (many ? `Array<${attribute.type}>` : attribute.type);
    }

    makeExampleValue(attribute: any) {
        const many = this.cardinalityIsMany(attribute.cardinality);
        const value = (() => {
            switch (attribute.type) {
                case "string": return "example";
                case "integer": return 1;
                case "number": return 1000.5;
                case "boolean": return true;
                case "date":
                case "datetime": return new Date("2026-01-01T00:00:00.000Z");
                case "time": return "12:00:00";
                default: return null;
            }
        })();

        return many ? [value] : value;
    }

    async generateData(data: any, apiKey: any) {
        
        const client = new OpenAI({ apiKey });

        console.log("Generando fake data con Open AI...");
        const response = await client.responses.create({
            model: "gpt-6-luna",
            input: `A partire da questo json "${JSON.stringify(data)}" restituiscimi il json mantenendo 
                    la stessa struttura con i campi valorizzati in base al tipo senza aggiungere altro.`,
        });
        console.log(`Generati i dati:\n${response.output_text}`);

        return JSON.parse(response.output_text);
    }
}
