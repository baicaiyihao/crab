mint nft  
sui client call --package $packageid --module tabledemo --function mint_user_nft --args $UserNFTTable $Userstate $GasPool $suicoin --gas-budget 100000000  
Transaction Digest: 4mfADTL4hbLx1ZEmmf1DfRuQ7L1XgPr5qRgi2KCSSE3T
  
new_pool  
sui client call --package $packageid --module tabledemo --function new_pool --type-args $cointype --args $Coin $PoolTable $GasPool $suicoin $nft 0x6 --gas-budget 100000000  
Transaction Digest: 2yWKpfnjarNipR473Sa5phArF7KYZRhtxwzY2NqWdkUv
  
deposit  
sui client call --package $packageid --module tabledemo --function deposit --type-args $cointype --args $Coin $CoinPool $GasPool $suicoin $nft 0x6 --gas-budget 100000000  
Transaction Digest: C8AAKDTdtcUzZVadRBVfLUFjVx865b9VaNT4qep3X8Xv
  
withdraw  
sui client call --package $packageid --module tabledemo --function withdraw --type-args $cointype --args $CoinPool $transferinrecordid $GasPool $suicoin $nft 0x6 --gas-budget 100000000  
Transaction Digest: DV3frfZ65JeAcqQjkroaUkrTgCRgwWgce5F7R9WUovWV
  
new_mark_scam  
sui client call --package $packageid  --module tabledemo --function new_mark_scam --type-args $cointype --args $CoinPool $ScamCoinPool $GasPool $suicoin $nft --gas-budget 100000000  
Transaction Digest: J8j31fcpN2sqs4iRiK8qNSRgYtkj9GudVdjrTmfKN551
  
delect_mark_scam  
sui client call --package $packageid  --module tabledemo --function cancal_mark_scam --args $ScamCoin $GasPool $suicoin $nft --gas-budget 100000000  
Transaction Digest: 4bFWLSYRpJAcQJK8rnhaaS2gon2G8YT3YP5b19mtuqaS
  
add_mark_scam  
sui client call --package $packageid --module tabledemo --function add_mark_scam --args $ScamCoin $GasPool $suicoin $nft --gas-budget 100000000