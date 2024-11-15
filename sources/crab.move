module crab::transfer_any_coin {
    use std::type_name::get;
    use std::type_name::TypeName;
    use sui::balance::{Self,Balance};
    use sui::clock;
    use sui::clock::{timestamp_ms, Clock};
    use sui::coin::{Self,Coin,from_balance,into_balance};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{TxContext, sender};
    use sui::transfer::{share_object, public_transfer};



    //coin pool
    public struct CoinPool<phantom X> has key {
        id: UID,
        coin_x: Balance<X>,
    }

    //pool info
    public struct Poolinfo has copy, store{
        object: ID,
        cointype: TypeName
    }

    //transfer info
    public struct TransferInRecord has key {
        id:UID,
        user:address,
        amount: u64,
        asset_type: TypeName,
        timestamp: u64,
        is_claimed: u64,
    }

    //store pool info
    public struct PoolTable has key,store {
        id:UID,
        pool_map: vector<Poolinfo>,
    }

    //store transfer info
    public struct TransferRecordPool has key,store {
        id:UID,
        records: vector<ID>,
    }

    //init
    fun init(ctx:&mut TxContext){
        let pooltable = PoolTable{
            id:object::new(ctx),
            pool_map:vector::empty<Poolinfo>()
        };
        let transferrecordpool = TransferRecordPool{
            id:object::new(ctx),
            records: vector::empty<ID>(),
        };

        transfer::share_object(pooltable);
        transfer::share_object(transferrecordpool)
    }

    //create new pool and store pool info
    public fun new_pool<X>(
        coinx: Coin<X>,
        pooltable:&mut PoolTable,
        transferrecordpool:&mut TransferRecordPool,
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
        add_transferInRecord(coinvalue,typename,transferrecordpool,time,ctx);
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

    public fun add_transferInRecord(
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
        vector::push_back(&mut transferrecordpool.records,object_id);
        share_object(transferInRecord)
    }


    //deposit coin
    public fun deposit<X>(
        pool: &mut CoinPool<X>,
        coin_x: Coin<X>,
        transferrecordpool:&mut TransferRecordPool,
        time:& Clock,
        ctx:&mut TxContext
    ){
        let coinvalue = coin_x.value();
        let typename = get<X>();

        coin::put(&mut pool.coin_x, coin_x);
        add_transferInRecord(coinvalue,typename,transferrecordpool,time,ctx);
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

        assert!(sender(ctx) == transferinrecord.user, 100);
        assert!(typename == transferinrecord.asset_type, 101);

        let current_time = timestamp_ms(time);
        let one_month_in_ms: u64 = 30 * 24 * 60 * 60 * 1000; // 30天对应的毫秒数
        assert!(transferinrecordtime >= (current_time - one_month_in_ms), 102);
        assert!(transferinrecord.is_claimed == 0, 103);

        let coin_balance=balance::split(&mut pool.coin_x,transferinrecord.amount);
        let coin = from_balance(coin_balance,ctx);
        transferinrecord.is_claimed = transferinrecord.is_claimed + 1;
        public_transfer(coin,sender(ctx));
    }
}
