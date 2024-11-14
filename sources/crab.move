module demo::transfer_any_coin {
    use std::string::{String, to_ascii};
    use std::type_name::get;
    use std::type_name::TypeName;
    use sui::balance::{Self,Balance};
    use sui::coin::{Self,Coin,from_balance,into_balance, CoinMetadata};
    use sui::object::{Self, UID, ID};
    use sui::event;
    use sui::table;
    use sui::transfer::{public_transfer};
    use sui::tx_context::{TxContext, sender};

    //coin pool
    public struct Pool<phantom X> has key {
        id: UID,
        coin_x: Balance<X>,
    }

    //pool info
    public struct Poolinfo has copy, store{
        object: ID,
        cointype: TypeName
    }

    //store pool info
    public struct PoolTable has key,store {
        id:UID,
        pool_map: vector<Poolinfo>,
    }

    public struct TransferRecord has copy, drop {
        senderaddress: address,
        coin_type: String,
        amount: u64,
    }

    fun init(ctx:&mut TxContext){
        let table = PoolTable{
            id:object::new(ctx),
            pool_map:vector::empty<Poolinfo>()
        };
        transfer::share_object(table)
    }

    //create new pool and store pool info
    public fun new_pool<X>(
        coinx: Coin<X>,
        pooltable:&mut PoolTable,
        ctx: &mut TxContext
    ){
        let coin_balance = into_balance(coinx);
        let newpool = Pool<X> {
            id: object::new(ctx),
            coin_x: coin_balance,
        };
        let typename = get<X>();
        let pool_id = object::id(&newpool);

        let poolinfo = Poolinfo{
            object:pool_id,
            cointype:typename
        };
        vector::push_back(&mut pooltable.pool_map, poolinfo);
        transfer::share_object(newpool);
    }


    //deposit coin
    public fun deposit<X>(
        pool: &mut Pool<X>,
        coin_x: Coin<X>,
    ){
        coin::put(&mut pool.coin_x, coin_x);
    }

    //withdraw coin
    public fun withdraw<X>(
        pool: &mut Pool<X>,
        coin_x_amt: u64,
        ctx: &mut TxContext
    ){
        let coin_balance=balance::split(&mut pool.coin_x,coin_x_amt);
        let coin = from_balance(coin_balance,ctx);
        transfer::public_transfer(coin,sender(ctx))
    }

    public fun send_any_coin<X>(
        coinx: Coin<X>,
        cointype: String,
        to_address: address,
        ctx: &mut TxContext
    ) {

        let coin_x_value = coin::value(&coinx);
        public_transfer(coinx, to_address);


        event::emit(TransferRecord {
            senderaddress: tx_context::sender(ctx),
            coin_type: cointype,
            amount: coin_x_value,
        });
    }
}
