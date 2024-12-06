/*
/// Module: storeicon
module storeicon::storeicon;
*/
/*
/// Module: testwalrus
module testwalrus::testwalrus;
*/
module crab::storeicon {
    use std::string::{String};
    use sui::table::{Table, Self};
    use sui::transfer::share_object;

    public struct Storeicon has key,store{
        id:UID,
        iconmap:Table<String,String>
    }

    fun init(ctx:&mut TxContext){
        let storeicon = Storeicon{
            id:object::new(ctx),
            iconmap:table::new<String,String>(ctx)
        };
        share_object(storeicon);
    }

    public fun add_icons(coinnames: vector<String>,blobids: vector<String>,storecoin:&mut Storeicon){
        let length = vector::length(&coinnames);
        let blob_length = vector::length(&blobids);
        assert!(length == blob_length, 1001);
        let i = 0;
        while (i < length) {
            let coinname = vector::borrow(&coinnames, i);
            let blobid = vector::borrow(&blobids, i);
            table::add(&mut storecoin.iconmap, *coinname, *blobid);
            i + 1;
        }
    }

    public fun add_icon(coinnames: String,blobids: String,storecoin:&mut Storeicon){
        table::add(&mut storecoin.iconmap, coinnames, blobids);
    }

    public fun delete_icon(k: String,storecoin:&mut Storeicon){
        table::remove(&mut storecoin.iconmap,k);
    }
}

