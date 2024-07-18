//* @dev Function helper that checks if token is an eth address
//* this function is comonly used for 1inch aggregation contract
//* and as 1inch docs says it's better to use addr `0xeee...eee`
//* for ETH address instead of `zero addr` or other null address
//*
//* @return bool. True if ETH-used address
export function isEth(tokenAddress: string): boolean {
    const tokenAddressToLower = tokenAddress.toLowerCase();
    
    if(
        tokenAddressToLower === '0x0000000000000000000000000000000000000000' || 
        tokenAddressToLower === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
        tokenAddressToLower === '0x000000000000000000000000000000000000800a'
    ) {
        return true;
    }

    return false;
}