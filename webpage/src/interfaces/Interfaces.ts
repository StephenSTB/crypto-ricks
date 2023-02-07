export interface OriginalMetadata{
    name: string;
    id: number;
    external_url: string;
    iterations : number;
    vrf_message_hex: string;
    vrf_hash: string;
    vrf_proof: string;
    image: string;
    attributes: Array<Attribute>;
    network: string;
    chain_id: number;
    distributor: string;
    contract: string;
    signature: any;
}

export interface Metadata{
    name: string;
    id: number;
    external_url: string;
    previous_cid : string;
    vrf_message_hex: string;
    vrf_hash: string;
    vrf_proof: string;
    image: string;
    attributes: Array<Attribute>;
    network: string;
    chain_id: number;
    distributor: string;
    contract: string;
    signature: any;
}

export interface Attribute{
    display_type?: string;
    trait_type: string
    value: string | number;
}

export interface SwitchError{
	code: number
}

export interface ViewData{
    imageURL: string;
    id: number
}

export interface Meta{
    root: string;
    leaves: Array<string>;
    contract: string;
    signature: string;
}

