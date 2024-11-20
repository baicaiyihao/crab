# crab

```
#bash终端配置,创建.env文件然后source .env
ADMIN_CAP=0x3e9684dc7ff5933747aeb4134a35cac121cceaf89537c6e808e3b934b43b7496
USER_STATE=0x54ca192934be6f25cdb06741d264224c4578af96f383314295e1337717d7b900
UPGRADE_CAP=0x37066cc3e8eccb1ccd0a7d1ac8d548e9bcd830938ac8735094ebefb1ce3d7ea9
SCAM_COIN_POOL=0xec85baf22eb9432d4891286d412b80c654878f9af81422e27cb103744bbffad3
USER_NFT_TABLE=0x0ef04ce04f6058eb72269d39d28e73cbe4c678736c15189c1097fedec257b132
TRANSFER_RECORD_POOL=0xd73d15a2d22086dde64a4ab37b337d592a707ea56c0cd34062a7a4ba87b01c66
POOL_TABLE=0x67d6ca7cb10add732ad93284dd5c0bcba0963cb1430d037426cffe496e20a2fe
GAS_POOL=0x1a18b2f226e58172f23c388b5aa1333a6ee0521ee1226d6916574669a227a912
SUI_GAS_COIN1=0x1e818524137826b095dc097649bf32be8ec4421ef00d0aecb681c2bf88197341
SUI_GAS_COIN2=0x319acc6d2ad80e28cd8e9ce154bc6662e5c43c4e665b3c71d3e8f53a84302f98
SUI_GAS_COIN3=0x3c3cf5f26cd47948653bf686d81280fcb091a9b7fbc3df35ff7a038400b2bd2a
SUI_GAS_COIN4=0x4918e0949af269f4a0fdc7be5aae063a0e489080155d3f9904407bbc7acc243c
SUI_GAS_COIN5=0x7ce03f80c4dfa2c03b7db848b4ff5bff7a9524c5c2698d93cbd5b6c4041c1c06
SUI_GAS_COIN6=0xd8854b1178c67a0550125516c5445752797b24f53b8c356f67d34bb3c283d548
SUI_GAS_COIN7=0x282a17ecd1e018298ecd939c275cef3bad5c653f0ffc936a815fbac1a83106dd
SUI_GAS_COIN8=0x3530949e4bd73b0fc591ed20af43d54cd5f597870ee22331d0294140879e3016
PAKEAGEID=0xcb96afc481c59b37afdf214bf9702ba937b288269b108a021d8eaa43b6c4c79c
NFT=0x0c8d0cc93ca7e5fb30b7e4904970c1e957a96618312ef11a26a2c80892f927d1
cointype=0x35f68d0404b0dd676561abf3049031616658b6fd33bb50d05f198a47ca112b6f::al17er_coin::AL17ER_COIN
coin1=0x3929b719f68611222185352baed5ae3d5713fc62f1c8007f6411781a3e20b2b8
coin2=0xf865139a96347b142eabf78e415d83f158d08a22787d8da93c029a9a25a8960a
pool=0x58c1d2c6584e3c5e34d1173327d1239fc88bd854f62ea8d401099bc8d11ddeff
record=0xaf27b3d05c6c70df43c78e77ced7fb174e3e28272d37d52739e0812677c5ce89
cointype1=AL17ER_COIN
scamcoin=0x863237bee26446f288e359df614513cc3fa03ca4c4abd5c9628fda17f96de9fb


#功能执行步骤
mint coin
sui client call --package 0x33b47e6048ab066bc17bc444b5593e93e423e685bc17a6576f49aa98948d176f --module stomcoin --function mint --args 0x10c003a1dbd584a81a3929db3b530e86404c7853b60385227e78bfd61ee49040 100000000 0x21f62d821142d1a72d2b78ce0e3fee2ae01f38293e583c46e9a4be3f91544767 --gas-budget 10000000

step 1 mint nft
sui client call --package $PAKEAGEID --module demo --function mint_user_nft --args $GAS_POOL $SUI_GAS_COIN7 $USER_NFT_TABLE $USER_STATE --gas-budget 100000000

step 2 check nft
sui client call --package $PAKEAGEID --module demo --function mint_user_nft --args $GAS_POOL $SUI_GAS_COIN $USER_NFT_TABLE $USER_STATE --gas-budget 100000000
Error executing transaction '4vARh9qCjqSAXcE2YgEr3Y9MDZ2NzkQVw5v7dMMXiCzw': 1st command aborted within function '0x5f996bde111bfa6da1c0df6ae5eae7b87ff3a9d526993da71e698728d999f0f0::demo::check_nft' at instruction 22 with code 105

step 3 new_pool
sui client call --package $PAKEAGEID --module demo --function new_pool --type-args $cointype --args $coin1 $POOL_TABLE $GAS_POOL $SUI_GAS_COIN2 $TRANSFER_RECORD_POOL $NFT 0x6 --gas-budget 100000000

step 4 check pool
sui client call --package $PAKEAGEID --module demo --function new_pool --type-args $cointype --args $coin2 $POOL_TABLE $GAS_POOL $SUI_GAS_COIN $TRANSFER_RECORD_POOL $NFT 0x6 --gas-budget 100000000
Error executing transaction 'DUxenc8mHhfX5AmC1J8bw4fUYXCU8HxqaU61JsxKxy29': 1st command aborted within function '0x5f996bde111bfa6da1c0df6ae5eae7b87ff3a9d526993da71e698728d999f0f0::demo::check_pool' at instruction 22 with code 104

step 5 deposit
sui client call --package $PAKEAGEID --module demo --function deposit --type-args $cointype --args $coin2 $pool $GAS_POOL $SUI_GAS_COIN3 $TRANSFERRECORDPOOL $NFT 0x6 --gas-budget 100000000

step 6 withdraw
sui client call --package $PAKEAGEID --module demo --function withdraw --type-args $cointype --args $pool $GAS_POOL $SUI_GAS_COIN4 $record $NFT 0x6 --gas-budget 100000000

step 7 new_mark_scam
sui client call --package $PAKEAGEID --module demo --function new_mark_scam --args $GAS_POOL $SUI_GAS_COIN5 $cointype1 $SCAM_COIN_POOL $NFT --gas-budget 100000000

step 8 check
sui client call --package $PAKEAGEID --module demo --function new_mark_scam --args $GAS_POOL $SUI_GAS_COIN6 $cointype1 $SCAM_COIN_POOL $NFT --gas-budget 100000000

step 9 add_mark_scam
sui client call --package $PAKEAGEID --module demo --function add_mark_scam --args $GAS_POOL $SUI_GAS_COIN8 $scamcoin $SCAM_COIN_POOL $NFT --gas-budget 100000000


```