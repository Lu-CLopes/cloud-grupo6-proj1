Vagrant.configure("2") do |config|
	is_arm = RUBY_PLATFORM.include?("arm64") || RUBY_PLATFORM.include?("aarch64")
	config.vm.define "frontend" do |client|
		client.vm.box = "bento/ubuntu-22.04" if is_arm
		client.vm.box = "ubuntu/focal64" if !is_arm
		client.vm.box_architecture = "arm64" if is_arm
		client.vm.hostname = "frontend"
		#client.vm.network "forwarded_port", guest: 22, host: "2232"
		client.vm.network "private_network", ip: "10.20.30.1",netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
		client.vm.provider "virtualbox" do |vb|
			#vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"] if !is_arm
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--ioapic", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"] if !is_arm
			vb.gui = !is_arm
			vb.memory = "1024"
			vb.cpus = 1
			vb.name = "frontend"
			end
		client.vm.provision "shell", inline: <<-SHELL
			sudo apt-get -y update
			sudo apt-get -y install net-tools

			echo "net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/99-router.conf
			sudo sysctl -p /etc/sysctl.d/99-router.conf

			sudo iptables -t nat -A POSTROUTING -s 10.20.30.0/24 -o enp0s3 -j MASQUERADE
			echo iptables-persistent iptables-persistent/autosave_v4 boolean true | sudo debconf-set-selections
            echo iptables-persistent iptables-persistent/autosave_v6 boolean true | sudo debconf-set-selections
            sudo DEBIAN_FRONTEND=noninteractive apt-get -y install iptables-persistent
		SHELL
	end

	#config.vm.define "client02" do |client02|
		#client02.vm.box = "bento/ubuntu-22.04" if is_arm
		#client02.vm.box = "ubuntu/focal64" if !is_arm
		#client02.vm.box_architecture = "arm64" if is_arm
		#client02.vm.hostname = "client02"
		##client02.vm.network "forwarded_port", guest: 22, host: "2233"
		#client02.vm.network "private_network", ip: "10.1.1.1",netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
		#client02.vm.provider "virtualbox" do |vb|
		#	vb.gui = !is_arm
		#	vb.memory = "1024"
		#	vb.cpus = 1
		#	vb.name = "client02"
		#	end
		#client02.vm.provision "shell", inline: <<-SHELL
		#	sudo apt-get -y update
		#	sudo apt-get -y install net-tools
		#	#sudo apt-get -y install conntrack
		#	#sudo apt-get -y install lynx
		#	#sudo apt-get -y install telnet
		#SHELL
	#end
end
