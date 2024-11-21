module crab::demo {
    use std::ascii::String;
    use std::string::utf8;
    use sui::balance::{Balance,zero};
    use std::type_name::get;
    use std::type_name::TypeName;
    use sui::clock::{timestamp_ms, Clock};
    use sui::coin::{Self,Coin,from_balance,into_balance};
    use sui::display;
    use sui::package;
    use sui::tx_context::{sender};
    use sui::transfer::{share_object, public_transfer,transfer};

    // ==========================
    // Constants
    // ==========================
    const ERROR_INVALID_SENDER: u64 = 100;
    const ERROR_INVALID_ASSET_TYPE: u64 = 101;
    const ERROR_INVALID_TIMESTAMP: u64 = 102;
    const ERROR_ALREADY_CLAIMED: u64 = 103;
    const ERROR_ALREADY_EXISTS: u64 = 104;
    const ERROR_ALREADY_HAS_NFT: u64 = 105;
    const ERROR_ALREADY_VOTED: u64 = 106;
    const ERROR_INVALID_AMOUNT: u64 = 107;

    const ONE_MONTH_IN_MS: u64 = 30 * 24 * 60 * 60 * 1000;
    const GAS: u64 = 1000000;
    const POINTS: u64 = 10;
    const MARK_SCAM_POINTS: u64 = 5;

    // ==========================
    // General Structs
    // ==========================
    public struct DEMO has drop {}

    public struct AdminCap has key{
        id:UID,
    }

    // ==========================
    // Gas-Related
    // ==========================
    //store gas
    public struct GasPool has key{
        id:UID,
        suiBalance: Balance<0x2::sui::SUI>,
    }

    // ==========================
    // Coin-Related
    // ==========================
    // Represents a pool of a specific coin type.
    public struct CoinPool<phantom X> has key {
        id: UID,
        coin_x: Balance<X>,
    }

    // Stores metadata about a coin pool, including its ID and coin type.
    public struct Poolinfo has copy, store{
        object: ID,
        cointype: TypeName
    }

    // Represents a table that stores all the coin pools in the system.
    public struct PoolTable has key,store {
        id:UID,
        pool_map: vector<Poolinfo>,
    }

    // ==========================
    // User-Related(NFT)
    // ==========================
    // Represents an NFT held by a user.
    public struct DemoNFT has key, store {
        id:UID,
        userid:u64,
        users_points:u64
    }

    // Tracks the state of a user, including their ID and count of actions.
    public struct Userstate has key {
        id: UID,
        count: u64
    }

    // Maps a user's address to their NFT ID.
    public struct UserNFTMapping has copy,store {
        user_address: address,
        nft_id: ID,
    }

    // A table storing all user-to-NFT mappings.
    public struct UserNFTTable has key, store {
        id: UID,
        mappings: vector<UserNFTMapping>,
    }

    // ==========================
    // Transfer-Related
    // ==========================
    // Represents a record of a coin transfer.
    public struct TransferInRecord has key {
        id:UID,
        user:address,
        amount: u64,
        asset_type: TypeName,
        timestamp: u64,
        is_claimed: u64,
    }

    // Stores metadata about a transfer record, including its ID and user address.
    public struct TransferInRecordinfo has copy, store{
        transferInRecord_object: ID,
        users_address: address
    }

    // A table storing all transfer records.
    public struct TransferRecordPool has key,store {
        id:UID,
        records_map: vector<TransferInRecordinfo>,
    }

    // ==========================
    // ScamCoin-Related
    // ==========================
    // Represents a ScamCoin, including its type and check count.
    public struct ScamCoin has key{
        id: UID,
        cointype: String,
        checknum: u64
    }

    // Stores metadata about a ScamCoin.
    public struct ScamCoininfo has copy,store {
        cointype: String,
        ScamCoin_id: ID,
    }

    // Represents a user's vote for marking a ScamCoin.
    public struct UserVote has copy,store {
        user: address,
        coin_type: String,
    }

    // A pool storing all ScamCoins and user votes.
    public struct ScamCoinPool has key,store {
        id:UID,
        ScamCoin_map: vector<ScamCoininfo>,
        user_votes: vector<UserVote>,
    }


    // ==========================
    // init
    // ==========================
    // Initializes the module, creating initial data structures for gas, pools, NFTs, and ScamCoins.
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

    // ==========================
    // GAS Management Module
    // ==========================
    // Mint a new AdminCap object and transfer it to a specified address.
    public fun mintAdminCap(_:&AdminCap,to:address,ctx:&mut TxContext){
        let admin_cap=AdminCap{
            id:object::new(ctx)
        };
        transfer(admin_cap,to);
    }

    // Withdraw a specified amount of SUI from the gas pool and transfer it to a specified address.
    public fun withdraw_commision(_:&AdminCap, crabBank: &mut GasPool,amount:u64,to:address,ctx: &mut TxContext){
        assert!(crabBank.suiBalance.value() > amount, ERROR_INVALID_AMOUNT);
        let coin_balance= crabBank.suiBalance.split(amount);
        let coin=from_balance(coin_balance,ctx);
        public_transfer(coin,to);
    }

    // Deduct a fixed gas fee from the provided SUI coin and deposit it into the gas pool.
    fun commision(crabBank:&mut GasPool,dcoins:coin::Coin<0x2::sui::SUI>,_:&mut TxContext){
        assert!(dcoins.value() == GAS, ERROR_INVALID_AMOUNT);
        let into_balance = into_balance(dcoins);
        crabBank.suiBalance.join(into_balance);
    }

    // ==========================
    // User Management Module
    // ==========================
    // Check if a user already owns an NFT.
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

    // Mint a new NFT for a user.
    #[allow(lint(self_transfer))]
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


    // ==========================
    // Pool Management Module
    // ==========================
    // Check if a pool with the specified coin type already exists.
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

    // Add a new pool entry to the PoolTable.
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

    // Add a new transfer record to the TransferRecordPool.
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

    // Create a new pool for a specific coin type.
    public fun new_pool<X>(
        coinx: Coin<X>,
        pooltable:&mut PoolTable,
        crabBank: &mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
        transferrecordpool:&mut TransferRecordPool,
        nft:&mut DemoNFT,
        time:& Clock,
        ctx: &mut TxContext
    ){
        let typename = get<X>();
        check_pool(typename, pooltable);
        commision(crabBank,suiCoin,ctx);

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

    // ==========================
    // ScamCoin Module
    // ==========================
    // Check if a ScamCoin for the specified coin type already exists in the ScamCoinPool.
    public fun check_scam(
        typename: String,
        scampool:&mut ScamCoinPool,
    ){
        let mut i = 0;
        while (i < vector::length(&scampool.ScamCoin_map)) {
            let scaminfo = &scampool.ScamCoin_map[i];
            assert!(scaminfo.cointype != typename, ERROR_ALREADY_EXISTS);
            i = i + 1;
        };
    }

    // Check if a user has already marked a specific coin type as a scam.
    public fun check_mark_scam(
        typename: String,
        scampool:&mut ScamCoinPool,
        ctx:&mut TxContext
    ){
        let mut i = 0;

        // 遍历 user_votes 中的每个 UserVote
        while (i < vector::length(&scampool.user_votes)) {
            let vote = &scampool.user_votes[i];
            assert!(vote.coin_type == typename && vote.user != sender(ctx)  , ERROR_ALREADY_VOTED);
            i = i + 1;
        };
    }

    // Create a new ScamCoin and record its information in the ScamCoinPool.
    public fun new_mark_scam(
        crabBank: &mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
        scamcointype: String,
        scamCoinPool:&mut ScamCoinPool,
        nft:&mut DemoNFT,
        ctx:&mut TxContext
    ){
        check_scam(scamcointype, scamCoinPool);
        commision(crabBank,suiCoin,ctx);
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

    // Increment the check count for an existing ScamCoin and record the user's vote.
    public fun add_mark_scam(
        crabBank:&mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
        scamcoin: &mut ScamCoin,
        scampool: &mut ScamCoinPool,
        nft:&mut DemoNFT,
        ctx:&mut TxContext
    ){
        let cointype = scamcoin.cointype;
        check_mark_scam(cointype, scampool, ctx);

        commision(crabBank,suiCoin,ctx);

        scamcoin.checknum = scamcoin.checknum + 1;
        nft.users_points = nft.users_points + MARK_SCAM_POINTS;
        add_user_mark_info(cointype,scampool,ctx)
    }

    // Record a new ScamCoin and the user's vote in the ScamCoinPool.
    public fun add_Scaminfo(
        scamcoin_id: ID,
        typename: String,
        scampool:&mut ScamCoinPool,
        ctx:&mut TxContext
    ){
        let scaminfo = ScamCoininfo{
            cointype:typename,
            ScamCoin_id:scamcoin_id
        };

        vector::push_back(&mut scampool.ScamCoin_map, scaminfo);
        add_user_mark_info(typename,scampool,ctx)
    }

    public fun add_user_mark_info(
        typename: String,
        scampool:&mut ScamCoinPool,
        ctx:&mut TxContext
    ){
        let vote = UserVote {
            user: sender(ctx),
            coin_type: typename,
        };
        vector::push_back(&mut scampool.user_votes, vote);
    }

    // ==========================
    // Funds Management Module
    // ==========================
    // Deposit a coin into the pool and record the transaction details.
    // This function allows users to deposit a specific coin type into a pool
    // while handling gas fees and updating user points and transfer records.
    public fun deposit<X>(
        coin_x: Coin<X>,
        pool: &mut CoinPool<X>,
        crabBank:&mut GasPool,
        suiCoin: coin::Coin<0x2::sui::SUI>,
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

    // Withdraw a coin from the pool based on a transfer record.
    // This function validates a user's withdrawal request, checks transaction records,
    // and adjusts user points, pool balances, and transaction states.
    #[allow(lint(self_transfer))]
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