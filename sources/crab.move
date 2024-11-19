/*
/// Module: demo
module demo::demo;
*/
module crab::demo {
    use std::string::utf8;
    use sui::balance::{Balance,zero};
    use std::type_name::get;
    use std::type_name::TypeName;
    use sui::clock::{timestamp_ms, Clock};
    use sui::coin::{Self,Coin,from_balance,into_balance};
    use sui::display;
    use sui::package;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{TxContext, sender};
    use sui::transfer::{share_object, public_transfer,transfer};

    const ERROR_INVALID_SENDER: u64 = 100;
    const ERROR_INVALID_ASSET_TYPE: u64 = 101;
    const ERROR_INVALID_TIMESTAMP: u64 = 102;
    const ERROR_ALREADY_CLAIMED: u64 = 103;
    const ERROR_NOT_FOUND_NFT: u64 = 104;
    const ERROR_ALREADY_EXISTS: u64 = 105;
    const ERROR_ALREADY_HAS_NFT: u64 = 106;
    const ERROR_ALREADY_VOTED: u64 = 107;
    const ERROR_INVALID_AMOUNT: u64 = 108;

    const ONE_MONTH_IN_MS: u64 = 30 * 24 * 60 * 60 * 1000;
    const POINTS: u64 = 10;
    const MARK_SCAM_POINTS: u64 = 5;

    public struct DEMO has drop {}

    public struct AdminCap has key{
        id:UID,
    }

    //gas pool
    public struct GasPool has key{
        id:UID,
        suiBalance: Balance<0x2::sui::SUI>,
    }

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

    //NFT list
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

    //check Scamcoin
    public struct ScamCoin has key{
        id: UID,
        cointype: TypeName,
        checknum: u64
    }

    //Scamcoin info
    public struct ScamCoininfo has copy,store {
        cointype: TypeName,
        ScamCoin_id: ID,
    }

    public struct UserVote has copy,store {
        user: address,
        coin_type: TypeName,
    }
    //Scamcoin pool
    public struct ScamCoinPool has key,store {
        id:UID,
        ScamCoin_map: vector<ScamCoininfo>,
        user_votes: vector<UserVote>,
    }


    //init
    fun init(witness: DEMO ,ctx:&mut TxContext){
        let crabBank = GasPool{
            id: object::new(ctx),
            suiBalance: zero<0x2::sui::SUI>(),
        };
        let admin_cap = AdminCap{
            id:object::new(ctx),
        };

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
        let scam_coin_pool = ScamCoinPool {
            id: object::new(ctx),
            ScamCoin_map: vector::empty<ScamCoininfo>(),
            user_votes: vector::empty<UserVote>(),
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
        transfer(admin_cap,sender(ctx));
        share_object(pooltable);
        share_object(transferrecordpool);
        share_object(user_nft_table);
        share_object(userstate);
        share_object(crabBank);
        share_object(scam_coin_pool);

    }

    //mint admincap
    public fun mintAdminCap(admin_cap:&AdminCap,to:address,ctx:&mut TxContext){
        assert!(sender(ctx) == object::owner(admin_cap.id), ERROR_INVALID_SENDER);
        let admin_cap=AdminCap{
            id:object::new(ctx)
        };
        transfer(admin_cap,to);
    }

    //withdraw gaspool
    public fun withdraw_commision(admin_cap:&AdminCap, crabBank: &mut GasPool,amount:u64,to:address,ctx: &mut TxContext){
        assert!(sender(ctx) == object::owner(admin_cap.id), ERROR_INVALID_SENDER);
        assert!(crabBank.suiBalance.value() > amount, ERROR_INVALID_AMOUNT);
        let coin_balance= crabBank.suiBalance.split(amount);
        let coin=from_balance(coin_balance,ctx);
        public_transfer(coin,to);
    }

    //commision gas
    fun commision(crabBank:&mut GasPool,dcoins:coin::Coin<0x2::sui::SUI>,ctx:&mut TxContext){
        let mut into_balance = into_balance(dcoins);
        let despoitCoin = into_balance.split(1000000);
        crabBank.suiBalance.join(despoitCoin);
        let coin_withdraw = from_balance(into_balance,ctx);
        public_transfer(coin_withdraw,ctx.sender());
    }

    //mint user nft
    public fun mint_user_nft(
        crabBank: &mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
        user_nft_table: &mut UserNFTTable,
        userstate: &mut Userstate,
        ctx: &mut TxContext
    ){
        let user_address = sender(ctx);
        check_nft(user_address, user_nft_table);

        commision(crabBank,suiCoin,ctx);
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

    //mark scamcoin
    public fun new_mark_scam(
        scamcointype: TypeName,
        scamCoinPool:&mut ScamCoinPool,
        nft:&mut DemoNFT,
        ctx:&mut TxContext
    ){
        check_scam(scamcointype, scamCoinPool);
        let newscancoin = ScamCoin{
            id: object::new(ctx),
            cointype: scamcointype,
            checknum: 1
        };
        let scancoinid = object::id(&newscancoin);
        add_Scaminfo(scancoinid,scamcointype,scamCoinPool,ctx);
        nft.users_points = nft.users_points + MARK_SCAM_POINTS;
        share_object(newscancoin);
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
        let typename = get<X>();
        check_pool(typename, pooltable);

        let coinvalue = coinx.value();
        let coin_balance = into_balance(coinx);
        let newpool = CoinPool<X> {
            id: object::new(ctx),
            coin_x: coin_balance,
        };

        let pool_id = object::id(&newpool);
        add_poolinfo(pool_id,typename,pooltable);
        add_transferInRecord_info(coinvalue,typename,transferrecordpool,time,ctx);
        nft.users_points = nft.users_points + POINTS;
        share_object(newpool);
    }

    //check user nft
    public fun check_nft(
        user_address: address,
        user_nft_table: &mut UserNFTTable
    ) {
        let mut i = 0;

        while (i < vector::length(&user_nft_table.mappings)) {
            let mapping = &user_nft_table.mappings[i];
            assert!(mapping.user_address != user_address, ERROR_ALREADY_HAS_NFT);
            i = i + 1;
        };
    }

    //check coin pool
    public fun check_pool(
        typename: TypeName,
        pooltable:&mut PoolTable,
    ){
        let mut i = 0;
        while (i < vector::length(&pooltable.pool_map)) {
            let poolinfo = &pooltable.pool_map[i];
            assert!(poolinfo.cointype != typename, ERROR_ALREADY_EXISTS);
            i = i + 1;
        };
    }

    //check coin pool
    public fun check_scam(
        typename: TypeName,
        scampool:&mut ScamCoinPool,
    ){
        let mut i = 0;
        while (i < vector::length(&pooltable.ScamCoin_map)) {
            let scaminfo = &scampool.ScamCoin_map[i];
            assert!(scaminfo.cointype != typename, ERROR_ALREADY_EXISTS);
            i = i + 1;
        };
    }

    //check coin pool
    public fun check_mark_scam(
        typename: TypeName,
        scampool:&mut ScamCoinPool,
        ctx:&mut TxContext
    ){
        let mut i = 0;

        // 遍历 user_votes 中的每个 UserVote
        while (i < vector::length(&scam_coin_pool.user_votes)) {
            let vote = &scampool.user_votes[i];
            assert!(vote.coin_type == typename && vote.user != sender(ctx)  , ERROR_ALREADY_VOTED);
            i = i + 1;
        };
    }

    public fun add_Scaminfo(
        scamcoin_id: ID,
        typename: TypeName,
        scampool:&mut ScamCoinPool,
        ctx:&mut TxContext
    ){
        let scaminfo = ScamCoininfo{
            cointype:typename,
            ScamCoin_id:scamcoin_id
        };
        let vote = UserVote {
            user: sender(ctx),
            coin_type: typename,
        };
        vector::push_back(&mut scampool.ScamCoin_map, scaminfo);
        vector::push_back(&mut scampool.user_votes, vote);
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

    //add_mark_scam
    public fun add_mark_scam(
        crabBank:&mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
        scamcoin: &mut ScamCoin,
        scampool: &mut ScamCoinPool,
        nft:&mut DemoNFT,
        ctx:&mut TxContext
    ){
        commision(crabBank,suiCoin,ctx);
        let cointype = scamcoin.cointype;
        check_scam(cointype,scampool);

        scamcoin.checknum = scamcoin.checknum + 1;
        nft.users_points = nft.users_points + MARK_SCAM_POINTS;
    }


    //deposit coin
    public fun deposit<X>(
        coin_x: Coin<X>,
        crabBank:&mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
        pool: &mut CoinPool<X>,
        transferrecordpool:&mut TransferRecordPool,
        nft:&mut DemoNFT,
        time:& Clock,
        ctx:&mut TxContext
    ){
        commision(crabBank,suiCoin,ctx);
        let coinvalue = coin_x.value();
        let typename = get<X>();
        nft.users_points = nft.users_points + POINTS;

        coin::put(&mut pool.coin_x, coin_x);
        add_transferInRecord_info(coinvalue,typename,transferrecordpool,time,ctx);
    }

    //withdraw coin
    public fun withdraw<X>(
        pool: &mut CoinPool<X>,
        crabBank:&mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
        transferinrecord:&mut TransferInRecord,
        nft:&mut DemoNFT,
        time:& Clock,
        ctx: &mut TxContext
    ){
        let typename = get<X>();
        let transferinrecordtime = transferinrecord.timestamp;
        commision(crabBank,suiCoin,ctx);

        assert!(sender(ctx) == transferinrecord.user, ERROR_INVALID_SENDER);
        assert!(typename == transferinrecord.asset_type, ERROR_INVALID_ASSET_TYPE);

        let current_time = timestamp_ms(time);
        assert!(transferinrecordtime >= (current_time - ONE_MONTH_IN_MS), ERROR_INVALID_TIMESTAMP);
        assert!(transferinrecord.is_claimed == 0, ERROR_ALREADY_CLAIMED);

        let coin_balance= pool.coin_x.split(transferinrecord.amount);
        let coin = from_balance(coin_balance,ctx);
        nft.users_points = nft.users_points - POINTS;
        transferinrecord.is_claimed = transferinrecord.is_claimed + 1;
        public_transfer(coin,sender(ctx));
    }
}