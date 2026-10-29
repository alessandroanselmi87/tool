
import { ObjectId } from 'mongodb';
import OpenAI from "openai";
import {
    LabeledSchema,
    Entity,
    Relationship,
    Attribute,
    Encapsulation,
    Cardinality
 } from './interfaces.js';
import { parseJson } from './utils.js';

export default class Collection {

    create(labeledSchema: LabeledSchema) {
        const map: any = {};
        console.log(`Costruisco una mappa di entità`);
        for (const entity of labeledSchema.schema.entities) {
            let obj: any = {};
            for (const attribute of entity.attributes) {
                obj[attribute.name] = this.makeAttributeType(attribute);
            }
            map[entity.name] = obj;
        }
        console.log("Costruisco una collezione di documenti...");
        let collection = [];
        for (const main_entity of labeledSchema.labeling.main_entities) {
            console.log(`Costruisco il documento per ${main_entity.entity}`);
            let document = this.buildDocument(main_entity.entity, labeledSchema, map, true);
            for (const reference of labeledSchema.labeling.references) {
                let entity = labeledSchema.schema.entities.find((item: Entity) => item.name === reference.target);
                if (!entity) {
                    throw new Error(`L'entità "${reference.target}" non trovata`);
                }
                let identifiers = entity.attributes.filter((item: Attribute) => entity.identifier.includes(item.name));
                if (identifiers.length === 0) {
                    throw new Error(`Attributi non trovati per "${entity.name}"`);
                }
                let item: any = {};
                if (reference.label === "id") {
                    identifiers[0].type = "integer";
                    item[`${entity.name}_id`] = this.makeAttributeType(identifiers[0]);
                } else if (reference.label === "key") {
                    for (const identifier of identifiers) {
                        item[`${entity.name}_${identifier.name}`] = this.makeAttributeType(identifier);
                    }
                }
                let relationship_attributes = labeledSchema.schema.relationships.find((item: Relationship) => item.name === reference.relationship);
                if (!relationship_attributes) {
                    throw new Error(`Relationship non trovata per "${reference.relationship}"`);
                }
                for (const attribute of relationship_attributes.attributes) {
                    item[attribute.name] = this.makeAttributeType(attribute);
                }
                if (main_entity.entity === reference.stored_in) {
                    document[reference.relationship] = [item];
                }
            }
            collection.push({ collection: main_entity.entity, document });
        }

        return collection;
    }

    buildDocument(entity: string, labeledSchema: LabeledSchema, map: any, isFirst: boolean) {

        let node = {
            ...(isFirst ? { _id: new ObjectId() } : {}),
            ...map[entity]
        };

        isFirst = false;

        const children = labeledSchema.labeling.encapsulations.filter((item: Encapsulation) => item.into === entity);

        for (const child of children) {
            let relationship = labeledSchema.schema.relationships.find((item: Relationship) => item.name === child.relationship);
            if (!relationship) {
                throw new Error(`Relationship non trovata per "${child.relationship}"`);
            }
            let attributes_relationship: any = {};
            for (const attribute of relationship.attributes) {
                attributes_relationship[attribute.name] = this.makeAttributeType(attribute);
            }
            if (!node[child.relationship]) {
                node[child.relationship] = [{
                    [child.entity]: {},
                    ...attributes_relationship,
                }];
            }
            node[child.relationship][0][child.entity] = { ...this.buildDocument(child.entity, labeledSchema, map, isFirst) };
        }

        return node;
    }

    cardinalityIsMany(cardinality: Cardinality) {
       return (cardinality?.max === "N" || Number(cardinality?.max) > 1);
    }

    makeSize(attribute: Attribute) {
        if (attribute.cardinality.max !== "N" && Number(attribute.cardinality.max) > 1) {
            return `[${attribute.cardinality.max}]`;
        }
        return ``;
    }

    makeAttributeType(attribute: Attribute) {
        const many = this.cardinalityIsMany(attribute.cardinality);
        return (many ? `Array<${attribute.type}>${this.makeSize(attribute)}` : attribute.type);
    }

    async generateData(data: any, apiKey: any) {
        
        const client = new OpenAI({ apiKey });

        console.log("Generando fake data con Open AI...");
        const response = await client.responses.create({
            model: process.env.MODEL_GPT,
            input: `A partire da questo json "${JSON.stringify(data)}" restituiscimi il json mantenendo 
                    la stessa struttura con i campi valorizzati in base al tipo senza aggiungere altro.`,
        });
        console.log(`Generati i dati:\n${response.output_text}`);

        return parseJson(response.output_text);
    }
}
