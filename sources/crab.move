/*
/// Module: demo
module demo::demo;
*/
module crab::demo {
    use std::string::utf8;
    use std::type_name::get;
    use std::type_name::TypeName;
    use sui::balance::{Balance};
    use sui::clock::{timestamp_ms, Clock};
    use sui::coin::{Self,Coin,from_balance,into_balance};
    use sui::display;
    use sui::package;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{TxContext, sender};
    use sui::transfer::{share_object, public_transfer};

    const ERROR_INVALID_SENDER: u64 = 100;
    const ERROR_INVALID_ASSET_TYPE: u64 = 101;
    const ERROR_INVALID_TIMESTAMP: u64 = 102;
    const ERROR_ALREADY_CLAIMED: u64 = 103;
    const ERROR_NOT_FOUND_NFT: u64 = 104;

    const ONE_MONTH_IN_MS: u64 = 30 * 24 * 60 * 60 * 1000;
    const NEW_POOL_POINT: u64 = 20;
    const DEPOSIT_POINT: u64 = 10;

    public struct DEMO has drop {}

    //coin pool
    public struct CoinPool<phantom X> has key {
        id: UID,
        coin_x: Balance<X>,
    }

    //users
    public struct DemoNFT has key, store {
        id:UID,
        userid:u64,
        users_points:u64
    }

    //userid
    public struct Userstate has key {
        id: UID,
        count: u64
    }

    //transfer
    public struct TransferInRecord has key {
        id:UID,
        user:address,
        amount: u64,
        asset_type: TypeName,
        timestamp: u64,
        is_claimed: u64,
    }

    //pool info
    public struct Poolinfo has copy, store{
        object: ID,
        cointype: TypeName
    }

    //transfer info
    public struct TransferInRecordinfo has copy, store{
        transferInRecord_object: ID,
        users_address: address
    }

    //store pool info
    public struct PoolTable has key,store {
        id:UID,
        pool_map: vector<Poolinfo>,
    }

    public struct UserNFTMapping has copy,store {
        user_address: address,
        nft_id: ID,
    }

    //store user info
    public struct UserNFTTable has key, store {
        id: UID,
        mappings: vector<UserNFTMapping>,
    }

    //store transfer info
    public struct TransferRecordPool has key,store {
        id:UID,
        records_map: vector<TransferInRecordinfo>,
    }

    //init
    fun init(witness: DEMO ,ctx:&mut TxContext){
        let pooltable = PoolTable{
            id:object::new(ctx),
            pool_map:vector::empty<Poolinfo>()
        };
        let transferrecordpool = TransferRecordPool{
            id:object::new(ctx),
            records_map: vector::empty<TransferInRecordinfo>(),
        };
        let user_nft_table = UserNFTTable {
            id: object::new(ctx),
            mappings: vector::empty<UserNFTMapping>(),
        };
        let keys = vector[
            utf8(b"name"),
            utf8(b"image_url"),
            utf8(b"description")
        ];

        let values = vector[
            utf8(b"DemoNFT"),
            utf8(b"https://avatars.githubusercontent.com/baicaiyihao"),
            utf8(b"crab demo")
        ];

        let publisher = package::claim(witness, ctx);
        let mut display = display::new_with_fields<DemoNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        let userstate = Userstate{
            id: object::new(ctx),
            count: 0
        };

        public_transfer(publisher, sender(ctx));
        public_transfer(display, sender(ctx));
        share_object(pooltable);
        share_object(transferrecordpool);
        share_object(user_nft_table);
        share_object(userstate);

    }

    //mint user nft
    public fun mint_user_nft(
        user_nft_table: &mut UserNFTTable,
        userstate: &mut Userstate,
        ctx: &mut TxContext
    ){
        userstate.count = userstate.count + 1;

        let nft = DemoNFT {
            id: object::new(ctx),
            userid: userstate.count,
            users_points: 0,
        };

        let nft_id = object::id(&nft);
        let new_mapping = UserNFTMapping {
            user_address: sender(ctx),
            nft_id,
        };

        vector::push_back(&mut user_nft_table.mappings, new_mapping);

        public_transfer(nft, sender(ctx))
    }

    //create new pool and store pool info
    public fun new_pool<X>(
        coinx: Coin<X>,
        pooltable:&mut PoolTable,
        transferrecordpool:&mut TransferRecordPool,
        nft:&mut DemoNFT,
        time:& Clock,
        ctx: &mut TxContext
    ){
        let coinvalue = coinx.value();
        let coin_balance = into_balance(coinx);
        let newpool = CoinPool<X> {
            id: object::new(ctx),
            coin_x: coin_balance,
        };
        let typename = get<X>();
        let pool_id = object::id(&newpool);
        add_poolinfo(pool_id,typename,pooltable);
        add_transferInRecord_info(coinvalue,typename,transferrecordpool,time,ctx);
        nft.users_points = nft.users_points + NEW_POOL_POINT;
        share_object(newpool);
    }


    public fun add_poolinfo(
        pool_id: ID,
        typename: TypeName,
        pooltable:&mut PoolTable,
    ){
        let poolinfo = Poolinfo{
            object: pool_id,
            cointype: typename
        };
        vector::push_back(&mut pooltable.pool_map, poolinfo);
    }

    public fun add_transferInRecord_info(
        coinvalue: u64,
        typename: TypeName,
        transferrecordpool:&mut TransferRecordPool,
        time:& Clock,
        ctx:&mut TxContext
    ){
        let transferInRecord = TransferInRecord{
            id:object::new(ctx),
            user: sender(ctx),
            amount: coinvalue,
            asset_type: typename,
            timestamp: timestamp_ms(time),
            is_claimed: 0
        };
        let object_id= object::id(&transferInRecord);
        let trans = TransferInRecordinfo{
            transferInRecord_object:object_id,
            users_address: sender(ctx)
        };
        vector::push_back(&mut transferrecordpool.records_map,trans);
        share_object(transferInRecord)
    }


    //deposit coin
    public fun deposit<X>(
        pool: &mut CoinPool<X>,
        coin_x: Coin<X>,
        transferrecordpool:&mut TransferRecordPool,
        nft:&mut DemoNFT,
        time:& Clock,
        ctx:&mut TxContext
    ){
        let coinvalue = coin_x.value();
        let typename = get<X>();
        nft.users_points = nft.users_points + DEPOSIT_POINT;

        coin::put(&mut pool.coin_x, coin_x);
        add_transferInRecord_info(coinvalue,typename,transferrecordpool,time,ctx);

    }

    //withdraw coin
    public fun withdraw<X>(
        pool: &mut CoinPool<X>,
        transferinrecord:&mut TransferInRecord,
        time:& Clock,
        ctx: &mut TxContext
    ){
        let typename = get<X>();
        let transferinrecordtime = transferinrecord.timestamp;

        assert!(sender(ctx) == transferinrecord.user, ERROR_INVALID_SENDER);
        assert!(typename == transferinrecord.asset_type, ERROR_INVALID_ASSET_TYPE);

        let current_time = timestamp_ms(time);
        assert!(transferinrecordtime >= (current_time - ONE_MONTH_IN_MS), ERROR_INVALID_TIMESTAMP);
        assert!(transferinrecord.is_claimed == 0, ERROR_ALREADY_CLAIMED);

        let coin_balance= pool.coin_x.split(transferinrecord.amount);
        let coin = from_balance(coin_balance,ctx);
        transferinrecord.is_claimed = transferinrecord.is_claimed + 1;
        public_transfer(coin,sender(ctx));
    }
}
