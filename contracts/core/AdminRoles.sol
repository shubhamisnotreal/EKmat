// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AdminRoles {
    error NotAdmin();
    error ZeroAddress();
    error AlreadyAdmin();
    error NotAdminAccount();
    error LastAdminRemovalForbidden();

    mapping(address => bool) public isAdmin;
    uint256 public adminCount;

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) revert NotAdmin();
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        adminCount = 1;
        emit AdminAdded(msg.sender);
    }

    function addAdmin(address account) external onlyAdmin {
        if (account == address(0)) revert ZeroAddress();
        if (isAdmin[account]) revert AlreadyAdmin();

        isAdmin[account] = true;
        adminCount += 1;
        emit AdminAdded(account);
    }

    function removeAdmin(address account) external onlyAdmin {
        if (!isAdmin[account]) revert NotAdminAccount();
        if (adminCount <= 1) revert LastAdminRemovalForbidden();

        isAdmin[account] = false;
        adminCount -= 1;
        emit AdminRemoved(account);
    }
}