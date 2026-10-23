
export interface LabeledSchema {
    schema: Schema,
    labeling: Labeling,
    partition: Partition[]
}

export interface Labeling {
    main_entities: MainEntity[],
    entity_labels: EntityLabel[],
    encapsulations: Encapsulation[],
    references: Reference[]
}

export interface Partition {
    collection: string,
    main_entity: string,
    entities: string[],
    encapsulation_relationships: string[]
}

export interface Reference {
    relationship: string,
    stored_in: string,
    target: string,
    label: string,
    stored_role?: string,
    target_role?: string
}

export interface Encapsulation {
    relationship: string,
    entity: string,
    into: string
}

export interface MainEntity {
    entity: string,
    collection: string
}

export interface EntityLabel {
    entity: string,
    label: string
}

export interface Schema {
    entities: Entity[],
    relationships: Relationship[]
}

export interface Entity {
    name: string,
    attributes: Attribute[]
    identifier: String[]
}

export interface Relationship {
    name: string,
    sides: Side[],
    attributes: Attribute[]
}

export interface Side {
    entity: string,
    role: string,
    cardinality: Cardinality
}

export interface Attribute {
    name: string,
    type: string,
    cardinality: Cardinality
}

export interface Cardinality {
    min: number | string,
    max: number | string
}