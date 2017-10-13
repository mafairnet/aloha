Aloha IVR-AVP
===================
Inbound Voice Recording Automatic Verification Platform

![Aloha Dashboard](http://maf.mx/astricon/2017/images/aloha_interface.png)

Prerequisites
-----------
- CentOS 6.7-x86_64-minimal ISO
- Dejavu (Python AudioFingerPrinting library)
- Oreka OpenSource
- Python 2.6
- MySQL Server (5.1 or later)

Installation
-----------
This system needs 3 separate servers to work.
1. Free PBX
2. Oreka OpenSource
3. Aloha Server (with Dejavu (Audio Fingerprinting) Python Module)

#### System Architecture Diagram
![Aloha System Architecture](http://maf.mx/astricon/2017/images/aloha_system_architecture.png)

### Oreka OpenSource Server
Before you start you need two network interfaces on the Oreka Server. One will be to access the server and manage it. The other one will be the interface where we are going to receive all the VoIP traffic through a PortMirroring Configuration (AKA Promisc). Also the minimun requirements for the server are 2 cores in the processor and 2GB of RAM. 

1. Install CentOS 6 on a physical server or virtual server.
2. Disable SELinux (SELINUX=disabled)
```
yum install nano -y
nano /etc/sysconfig/selinux
reboot
```
3. Install Setup Tools and configure network devices to start at boot.
```
yum -y update
yum install setuptool system-config-network* system-config-firewall* system-config-securitylevel-tui system-config-keyboard ntsysv -y
setup
```
4. Install OrekaAudio Open Source with the next steps:
```
yum install -y git
cd /opt
git clone https://github.com/mafairnet/aloha.git
cd aloha/oreka/
tar xvf orkaudio-1.7-844-os-x86_64.centos6-installer.sh.tar
tar xvf orkweb-1.7-838-x64-os-linux-installer.sh.tar
chmod +x orkaudio-1.7-844.x86_64-x-x86_64.centos6-installer.sh
chmod +x orkweb-1.7-838-x64-os-linux-installer.sh
./orkaudio-1.7-844.x86_64-x-x86_64.centos6-installer.sh
```
5. Complete orkaudio installation proccess. On the installation process you must consider:
   1. Select the option i to continue installation process.
   2. Indicate that license file willl be installed later with 'l'.
6. Install MySQL Server.
```
yum install mysql-server -y
chkconfig mysqld on
service mysqld start
mysql_secure_installation
```
7. Log into the MySQL Server and create an empty DB called oreka.
```
create database oreka;
```
8. Install OrkWeb Open Source with the installer:
```
./orkweb-1.7-838-x64-os-linux-installer.sh
```
9. Edit OrkWeb web.xml
```
nano /opt/tomcat7/webapps/orkweb/WEB-INF/web.xml
```
10. Edit the ConfigDirectory param-value set "/opt/oreka/"
```
<param-name>ConfigDirectory</param-name>
<param-value>/opt/oreka/</param-value>
```
11. Edit OrkTrack web.xml
```
nano /opt/tomcat7/webapps/orktrack/WEB-INF/web.xml
```
12. Edit the ConfigDirectory param-value set "/opt/oreka/"
```
<param-name>ConfigDirectory</param-name>
<param-value>/opt/orkweb/</param-value>
```
13. Copy config files to /opt/oreka
```
mkdir /opt/oreka
cd /opt/aloha/oreka/opt/
cp * /opt/oreka/
```
14. Modifify the /opt/oreka/database.hbm.xml file and add your DB credentials.
```
<property name="hibernate.connection.url">jdbc:mysql://localhost/oreka</property>
<property name="hibernate.connection.password">PASSWORD</property>
<property name="hibernate.connection.username">USER</property>
```
15. Reconfigure iptables for access the OrekWeb Server
```
iptables -A INPUT -m state --state NEW -m tcp -p tcp --dport 8080 -j ACCEPT -m comment --comment "Tomcat Server port"
service iptables save
service iptables restart
iptables -F
```
16. Edit the configuration of the OrkAudio file "/etc/orkaudio/config.xml" and set de values of the next configurations.
```
<AudioOutputPath>/opt/tomcat7/webapps/ROOT</AudioOutputPath>
<StorageAudioFormat>pcmwav</StorageAudioFormat>
<!--In this case the network interface receiving all tha through port mirroring is eth1-->
<Devices>eth1</Devices>
```
17. Configure OrkAudio start at boot and start OrkAudio Service
```
chkconfig orkaudio on
service orkaudio start
```
18. Go to OrkWeb at http://SERVERIP:8080/orkweb/ and test calls are being recorded.

### PBX Server
**Steps to be added...

### Aloha Server
**Steps to be added...
