# thirsty-lions
Mitigate risk of social engineering watering-hole attacks by dynamically changing your user agent string.

In today’s online world, cyber adversaries use increasingly sophisticated attack techniques to breach large organizations. In particular, social engineering attacks have been leveraged in many high-profile breaches in recent years. A very clever technique used by attackers are "watering-hole" style attacks. These attacks compromise a legitimate website to execute drive-by download attacks by redirecting users to another domain with an exploit kit. To prevent water-hole attacks, organizations can use a slew of countermeasures that alter the environment information given by employees when they visit websites so as to deceive the attackers.

This extension is intended to thwart these social engineering waterhole attacks by spoofing the user agent string that your browser sends with each website request. The user agent string contains info such as your browser version and operating system, spoofing it can conceal your identity and mislead potential attackers.

The extension makes use of an algorithm developed at a leading research university which uses a game-theoretic model to implement an automated protection policy.

See https://ojs.aaai.org/index.php/AAAI/article/view/7050 for details. 

For instructions on how to install the extension, see: https://developers.chrome.com/extensions/getstarted
