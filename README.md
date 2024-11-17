# crab

```
#bash终端配置
export PKGID=0x2416793c4b3c93ff7ae036a0aa136a98210b1595824cfc09ffd3670c4ba85ba1
export USERSTATE=0xe0610afbe0eb63ddb93f7f2246fd17ed05e06bdddd0a2472e719e1120c20d50d
export USERNFTTABLE=0xb74d98e94afd976a9f7cf8a09c0734e653401d278d41142f46c7a862eea8a97a
export TRANSFERRECORDPOOL=0x42c6430ad9ae9c3bbeae8688ad393eb72c1cc912b1452434340eeb4d98dbe386
export POOLTABLE=0x01cf4eaf4590a1b4d83e14830bda715ac49df3bfc3e9d3b6e43707fb3f86a5b5
export USERNFT=0x3b292882bcd1abe961c85d4a0193912a16fa3956f6ce4a169224cc4424414cc4
export COINTYPE=0x33b47e6048ab066bc17bc444b5593e93e423e685bc17a6576f49aa98948d176f::stomcoin::STOMCOIN
export COIN1=0x86c2100e0cb4262233948ad1144a96c1cfbf34a4de796cebed69ad9b22dd585d
export COIN2=0xd4f4a64e613511a2449ae8a2187d15506021a578b2b899eeeca1bab3cd7056da
export pool=0x48b8f59497da13a1ddd8d1797e59ce9ee52ae05504ee13c1ea8433b878ffc814
export TransferInRecord1=0x11b41665042dbe533db6c1e2b3b71ea63b17945e482c60bda78f539c99a91b9d
export TransferInRecord2=0x6cf84432ad152a4c5236a5b03ff1740d1aa28c0a89759e88f691b25d90b69dea

#参数
$PKGID
$USERSTATE
$USERNFTTABLE
$TRANSFERRECORDPOOL
$POOLTABLE
$USERNFT
$COINTYPE
$COIN1
$COIN2
$pool
$TransferInRecord1
$TransferInRecord2

#功能执行步骤
mint coin
sui client call --package 0x33b47e6048ab066bc17bc444b5593e93e423e685bc17a6576f49aa98948d176f --module stomcoin --function mint --args 0x10c003a1dbd584a81a3929db3b530e86404c7853b60385227e78bfd61ee49040 100000000 0x21f62d821142d1a72d2b78ce0e3fee2ae01f38293e583c46e9a4be3f91544767 --gas-budget 10000000

step 1 mint nft
sui client call --package $PKGID --module demo --function mint_user_nft --args $USERNFTTABLE $USERSTATE --gas-budget 100000000

step 2 new_pool
sui client call --package $PKGID --module demo --function new_pool --type-args $COINTYPE --args $COIN1 $POOLTABLE $TRANSFERRECORDPOOL $USERNFT 0x6 --gas-budget 100000000

step 3 deposit  
sui client call --package $PKGID --module demo --function deposit --type-args $COINTYPE --args $pool $COIN2 $TRANSFERRECORDPOOL $USERNFT 0x6 --gas-budget 100000000

step 4 withdraw 
sui client call --package $PKGID --module demo --function withdraw --type-args $COINTYPE --args $pool $TransferInRecord1 0x6 --gas-budget 100000000

sui client call --package $PKGID --module demo --function withdraw --type-args $COINTYPE --args $pool $TransferInRecord2 0x6 --gas-budget 100000000



```