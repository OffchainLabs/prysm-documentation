import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { PrysmVersion, PrysmVersionCommand } from '@site/src/components/version.js';

The HTTP connection between your beacon node and execution node needs to be authenticated using a [JWT token](https://jwt.io/). There are several ways to generate this JWT token:

 - Use a utility like OpenSSL to create the token via command: `openssl rand -hex 32 | tr -d "\n" > "jwt.hex"`.
 - Use an execution client to generate the `jwt.hex` file.
 - Use Prysm to generate the `jwt.hex` file:

<Tabs groupId="os" defaultValue="others" values={[
    {label: 'Operating system:', value: 'label'},
    {label: 'Linux, MacOS, Arm64', value: 'others'},
    {label: 'Windows', value: 'win'}
]}>
  <TabItem className="unclickable-element" value="label"></TabItem>
  <TabItem value="win">

  ## Optional - This command is necessary only if you've previously configured `USE_PRYSM_VERSION`

  <PrysmVersionCommand prefix="SET USE_PRYSM_VERSION=" />


  ## Required

  ```
  prysm.bat beacon-chain generate-auth-secret
  ```
  
  </TabItem>
  <TabItem value="others">

   ## Optional - This command is necessary only if you've previously configured `USE_PRYSM_VERSION`

  <PrysmVersionCommand prefix="export USE_PRYSM_VERSION=" />


  ## Required
  
  ```
  ./prysm.sh beacon-chain generate-auth-secret
  ```

  </TabItem>
</Tabs>

Prysm will output a `jwt.hex` file path.

Move your `jwt.hex` file in your `ethereum` directory:

```
📂ethereum
┣ 📂consensus
┣ 📂execution
┣ 📄jwt.hex
```



:::caution

Ensure that the script, user, or terminal window used to create and access your JWT token has the permissions it needs. Windows users may need to run command windows as Administrator.

:::