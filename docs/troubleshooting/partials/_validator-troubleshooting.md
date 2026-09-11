<table>
    <tbody>
    <tr>
        <th style={{minWidth: 180 + 'px'}}>Scenario</th> 
        <th>Solution</th>
    </tr>
    <tr>
      <td>You see <code>Waiting for keymanager to initialize validator client with web UI...</code></td>
      <td>You'll usually see this message when your beacon node is trying to interact with a validator client instance before the beacon node is fully synced. This is a known limitation. When your beacon node is finished syncing, this message should go away. Visit [Check Node and Validator Status](/monitoring-alerts-metrics/check-node-and-validator-status.md) to learn how to check the sync status of your beacon node.</td>
    </tr>
    <tr>
      <td>Everything seems fine, but your validator balance is going down.</td>
      <td>If your validator client is running fine without errors but you're seeing your validator balance decrease, your beacon node may be experiencing issues with connectivity, stability, or synchronization. Check your beacon node logs to see if there are any errors or crashes.</td>
    </tr>
    <tr>
      <td>Can't import accounts, stuck in a loop. You see <code>Could not import accounts: could not write accounts: file already exists without proper 0600 permissions</code></td>
      <td>This usually happens when the account you're using doesn't have permission to read and write to the target directory. See <a href='https://github.com/OffchainLabs/prysm/issues/11130#issuecomment-1199984124'>this GitHub issue</a> for a workaround.</td>
    </tr>
    <tr>
      <td><code>level=warning msg="Failed to update proposer settings" error="could not submit signed registrations to beacon node: rpc error: code = InvalidArgument desc = Could not register block builder: could not register validator(s): unsupported error code: 502: did not receive 200 response from API: Builder API validator registration unsuccessful" prefix=validator slot=5069888</code></td>
      <td>Possibly an issue with mev-boost/relay if you constantly see this. Applies to pre-Gloas MEV-Boost registrations only; after the fork the validator submits builder preferences instead.</td>
    </tr>
    <tr>
    <td><code>Could not determine if beacon chain started: could not setup beacon chain ChainStart streaming client: rpc error: code = Unavailable desc = connection closed: could not connect" prefix=validator</code></td>
      <td>Your validator is not connected to your beacon node properly.</td>
    </tr>
    <tr>
    <td><code>Could not request attestation to sign at slot error=rpc error: code = Unavailable desc = the node is currently optimistic and cannot serve validators</code></td>
      <td>This usually means that your execution client isn't yet synchronized. Visit [Check Node and Validator Status](/monitoring-alerts-metrics/check-node-and-validator-status.md). </td>
    </tr>
    </tbody>
</table>
