module crab::tabledemo;

use std::string::utf8;
use std::type_name::{get, TypeName};
use sui::balance::{Balance, zero};
use sui::clock::{timestamp_ms, Clock};
use sui::coin::{Self, Coin, from_balance, into_balance};
use sui::display;
use sui::package;
use sui::table::{Self, Table};
use sui::transfer::{share_object, public_transfer, transfer};
use sui::tx_context::sender;

const ERROR_INVALID_ASSET_TYPE: u64 = 101;
const ERROR_INVALID_TIMESTAMP: u64 = 102;
const ERROR_ALREADY_CLAIMED: u64 = 103;
const ERROR_ALREADY_VOTED: u64 = 104;
const ERROR_INVALID_AMOUNT: u64 = 105;
const ERROR_NOT_VOTED: u64 = 106;

const ONE_MONTH_IN_MS: u64 = 30 * 24 * 60 * 60 * 1000;
const GAS: u64 = 1000000;
const POINTS: u64 = 10;

// ==========================
// General Structs
// ==========================
public struct TABLEDEMO has drop {}

public struct AdminCap has key {
    id: UID,
}

// ==========================
// Gas-Related
// ==========================
//store gas
public struct GasPool has key {
    id: UID,
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

public struct PoolTable has key, store {
    id: UID,
    pool_map: Table<TypeName, ID>,
}

// ==========================
// User-Related(NFT)
// ==========================
// Represents an NFT held by a user.
public struct CrabNFT has key, store {
    id: UID,
    userid: u64,
    userpoints: u64,
    transferdetail: Table<ID, TransferInRecord>,
}

public struct Userstate has key {
    id: UID,
    count: u64,
}

public struct UserNFTTable has key, store {
    id: UID,
    mappings: Table<address, ID>,
}

public struct TransferInRecord has key, store {
    id: UID,
    user: address,
    amount: u64,
    asset_type: TypeName,
    timestamp: u64,
    is_claimed: u64,
}

// ==========================
// ScamCoin-Related
// ==========================
// Represents a ScamCoin, including its type and check count.
public struct ScamCoin has key {
    id: UID,
    cointype: TypeName,
    votes: Table<address, bool>,
}

public struct ScamCoinPool has key, store {
    id: UID,
    ScamCoin_map: Table<TypeName, ID>,
}

// ==========================
// init
// ==========================
// Initializes the module, creating initial data structures for gas, pools, NFTs, and ScamCoins.
fun init(witness: TABLEDEMO, ctx: &mut TxContext) {
    let crabBank = GasPool {
        id: object::new(ctx),
        suiBalance: zero<0x2::sui::SUI>(),
    };

    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    let poolTable = PoolTable {
        id: object::new(ctx),
        pool_map: table::new<TypeName, ID>(ctx),
    };

    let userNFTTable = UserNFTTable {
        id: object::new(ctx),
        mappings: table::new<address, ID>(ctx),
    };

    let scamcoinpool = ScamCoinPool {
        id: object::new(ctx),
        ScamCoin_map: table::new<TypeName, ID>(ctx),
    };

    let keys = vector[utf8(b"name"), utf8(b"image_url"), utf8(b"description")];

    let values = vector[
        utf8(b"CrabNFT"),
        utf8(b"https://avatars.githubusercontent.com/baicaiyihao"),
        utf8(b"crab demo"),
    ];

    let publisher = package::claim(witness, ctx);
    let mut display = display::new_with_fields<CrabNFT>(
        &publisher,
        keys,
        values,
        ctx,
    );

    display::update_version(&mut display);

    let userstate = Userstate {
        id: object::new(ctx),
        count: 0,
    };

    transfer(admin_cap, sender(ctx));
    public_transfer(publisher, sender(ctx));
    public_transfer(display, sender(ctx));
    share_object(crabBank);
    share_object(poolTable);
    share_object(userNFTTable);
    share_object(userstate);
    share_object(scamcoinpool);
}

// ==========================
// GAS Management Module
// ==========================
// Mint a new AdminCap object and transfer it to a specified address.
public fun mintAdminCap(_: &AdminCap, to: address, ctx: &mut TxContext) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer(admin_cap, to);
}

// Withdraw a specified amount of SUI from the gas pool and transfer it to a specified address.
public fun withdraw_commision(
    _: &AdminCap,
    crabBank: &mut GasPool,
    amount: u64,
    to: address,
    ctx: &mut TxContext,
) {
    assert!(crabBank.suiBalance.value() > amount, ERROR_INVALID_AMOUNT);
    let coin_balance = crabBank.suiBalance.split(amount);
    let coin = from_balance(coin_balance, ctx);
    public_transfer(coin, to);
}

// Deduct a fixed gas fee from the provided SUI coin and deposit it into the gas pool.
fun commision(crabBank: &mut GasPool, dcoins: coin::Coin<0x2::sui::SUI>, _: &mut TxContext) {
    assert!(dcoins.value() == GAS, ERROR_INVALID_AMOUNT);
    let into_balance = into_balance(dcoins);
    crabBank.suiBalance.join(into_balance);
}

// ==========================
// User Management Module
// ==========================
// Mint a new NFT for a user.
#[allow(lint(self_transfer))]
public fun mint_user_nft(
    user_nft_table: &mut UserNFTTable,
    userstate: &mut Userstate,
    crabBank: &mut GasPool,
    suiCoin: coin::Coin<0x2::sui::SUI>,
    ctx: &mut TxContext,
) {
    let user_address = sender(ctx);
    userstate.count = userstate.count + 1;

    let nft = CrabNFT {
        id: object::new(ctx),
        userid: userstate.count,
        userpoints: 0,
        transferdetail: table::new<ID, TransferInRecord>(ctx),
    };

    let nft_id = object::id(&nft);
    table::add(&mut user_nft_table.mappings, user_address, nft_id);
    commision(crabBank, suiCoin, ctx);
    public_transfer(nft, user_address);
}

// ==========================
// Pool Management Module
// ==========================
public fun new_pool<X>(
    coinx: Coin<X>,
    pooltable: &mut PoolTable,
    crabBank: &mut GasPool,
    suiCoin: coin::Coin<0x2::sui::SUI>,
    nft: &mut CrabNFT,
    time: &Clock,
    ctx: &mut TxContext,
) {
    let typename = get<X>();
    let coinvalue = coinx.value();
    let coin_balance = into_balance(coinx);
    let newpool = CoinPool<X> {
        id: object::new(ctx),
        coin_x: coin_balance,
    };

    let transferInRecord = TransferInRecord {
        id: object::new(ctx),
        user: sender(ctx),
        amount: coinvalue,
        asset_type: typename,
        timestamp: timestamp_ms(time),
        is_claimed: 0,
    };

    let pool_id = object::id(&newpool);
    let transferid = object::id(&transferInRecord);
    table::add(&mut pooltable.pool_map, typename, pool_id);
    table::add(&mut nft.transferdetail, transferid, transferInRecord);
    nft.userpoints = nft.userpoints + POINTS;
    commision(crabBank, suiCoin, ctx);
    share_object(newpool);
}

public fun deposit<X>(
    coin_x: Coin<X>,
    pool: &mut CoinPool<X>,
    crabBank: &mut GasPool,
    suiCoin: coin::Coin<0x2::sui::SUI>,
    nft: &mut CrabNFT,
    time: &Clock,
    ctx: &mut TxContext,
) {
    let coinvalue = coin_x.value();
    let typename = get<X>();
    nft.userpoints = nft.userpoints + POINTS;

    coin::put(&mut pool.coin_x, coin_x);
    let transferInRecord = TransferInRecord {
        id: object::new(ctx),
        user: sender(ctx),
        amount: coinvalue,
        asset_type: typename,
        timestamp: timestamp_ms(time),
        is_claimed: 0,
    };
    let transferid = object::id(&transferInRecord);
    table::add(&mut nft.transferdetail, transferid, transferInRecord);
    commision(crabBank, suiCoin, ctx);
}

// Withdraw a coin from the pool based on a transfer record.
// This function validates a user's withdrawal request, checks transaction records,
// and adjusts user points, pool balances, and transaction states.
#[allow(lint(self_transfer))]
public fun withdraw<X>(
    pool: &mut CoinPool<X>,
    transferinrecordid: ID,
    crabBank: &mut GasPool,
    suiCoin: coin::Coin<0x2::sui::SUI>,
    nft: &mut CrabNFT,
    time: &Clock,
    ctx: &mut TxContext,
) {
    let transferinrecord = table::borrow_mut(&mut nft.transferdetail, transferinrecordid);

    let typename = get<X>();
    let current_time = timestamp_ms(time);
    let transferinrecordtime = transferinrecord.timestamp;

    assert!(typename == transferinrecord.asset_type, ERROR_INVALID_ASSET_TYPE);
    assert!(transferinrecordtime >= (current_time - ONE_MONTH_IN_MS), ERROR_INVALID_TIMESTAMP);
    assert!(transferinrecord.is_claimed == 0, ERROR_ALREADY_CLAIMED);

    let coin_balance = pool.coin_x.split(transferinrecord.amount);
    let coin = from_balance(coin_balance, ctx);

    nft.userpoints = nft.userpoints - POINTS;
    transferinrecord.is_claimed = transferinrecord.is_claimed + 1;
    commision(crabBank, suiCoin, ctx);
    public_transfer(coin, sender(ctx));
}

// ==========================
// ScamCoin Module
// ==========================
public fun new_mark_scam<X>(
    _: &mut CoinPool<X>,
    scamcoinpool: &mut ScamCoinPool,
    crabBank: &mut GasPool,
    suiCoin: coin::Coin<0x2::sui::SUI>,
    nft: &mut CrabNFT,
    ctx: &mut TxContext,
) {
    let typename = get<X>();

    let mut newscancoin = ScamCoin {
        id: object::new(ctx),
        cointype: typename,
        votes: table::new<address, bool>(ctx),
    };
    table::add(&mut newscancoin.votes, sender(ctx), true);

    let scancoinid = object::id(&newscancoin);

    table::add(&mut scamcoinpool.ScamCoin_map, typename, scancoinid);
    nft.userpoints = nft.userpoints + POINTS;
    commision(crabBank, suiCoin, ctx);
    share_object(newscancoin);
}

public fun add_mark_scam(
    scamcoin: &mut ScamCoin,
    crabBank: &mut GasPool,
    suiCoin: coin::Coin<0x2::sui::SUI>,
    nft: &mut CrabNFT,
    ctx: &mut TxContext,
) {
    let is_voted_opt = table::contains(&scamcoin.votes, sender(ctx));

    if (!is_voted_opt) {
        table::add(&mut scamcoin.votes, sender(ctx), true);
        nft.userpoints = nft.userpoints + POINTS;
    } else {
        let votes = table::borrow_mut(&mut scamcoin.votes, sender(ctx));
        assert!(*votes == false, ERROR_ALREADY_VOTED);
        table::add(&mut scamcoin.votes, sender(ctx), true);
    };
    commision(crabBank, suiCoin, ctx);
}

public fun delect_mark_scam(
    scamcoin: &mut ScamCoin,
    crabBank: &mut GasPool,
    suiCoin: coin::Coin<0x2::sui::SUI>,
    nft: &mut CrabNFT,
    ctx: &mut TxContext,
) {
    let is_voted = table::borrow_mut(&mut scamcoin.votes, sender(ctx));

    assert!(*is_voted == true, ERROR_NOT_VOTED);

    *is_voted = false;
    nft.userpoints = nft.userpoints - POINTS;
    commision(crabBank, suiCoin, ctx);
}
