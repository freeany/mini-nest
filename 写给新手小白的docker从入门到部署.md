# Docker介绍

docker的作用：

1. **快速跨平台安装应用所需要的环境**
2. **快速运行应用**
3. **快速的构建应用**，在交付阶段把软件及其运行环境打成一个软件包
4. **快速的分享应用**， 在docker Hub仓库推送和下载

官网介绍：

![image-20240821065840812](https://gitee.com/freeanyli/picture/raw/master/image-20240821065840812.png)

## 两个重要概念镜像和容器

在使用`docker`时经常会听到 镜像和容器这两个非常重要的名词，**镜像和容器**。

**镜像：**在docker中也叫`Images`，通俗来说就是一个软件包，如redis。

​	当有人说拉一个镜像下来，那么其实就是使用`docker pull xxx(如redis)`从应用市场下载一个软件包。

**容器：**是指使用镜像启动起来的一个应用。 每一个运行中的应用都称为一个容器。



## 应用从传统部署到容器化部署

![image-20240821094655127](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859011.png)

### 传统部署

传统部署就是物理机部署，在一台物理机部署多个应用，共享一台机器的环境。这种方式出现的问题就是如果一个应用出现内存泄漏无法及时回收的情况，会导致占用大多数的资源，所以就导致了其他应用性能的下降甚至无法运行。

### 虚拟机部署

虚拟机部署是指在物理机上运行多个虚拟机，在每个虚拟机上部署不同的应用，每个虚拟机都是一台完整的计算机。在虚拟机中如果其中一个应用内存炸了，只会影响到当前虚拟机内的应用，不会影响到其他虚拟机中的应用。但是性能消耗比较大，占用的体积也很大，还有就是断电的情况会让虚拟机中的数据丢失。

### 容器部署

现在最流行的容器部署类似于轻量级的vm。容器会共享操作系统内核，容器有自己的文件系统、CPU、内存、进程空间等。容器之间互相隔离。启动速度秒级。性能和体量消耗小。具备跨平台的特性。交付/部署可以保证开发、测试、生产环境的一致性。丰富的Docker Hub生态系统。而且docker不会有这么多优势速度慢，而且还很快。



# Docker安装

## 在 CentOS 上安装 Docker

### 1. 移除旧版本docker

```yaml
# 移除旧版本docker
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

### 2. 配置docker yum源

```bash
# 配置docker yum源。
sudo yum install -y yum-utils
sudo yum-config-manager \
--add-repo \
http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

### 3. 安装docker引擎

```bash
# 安装 最新 docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 4. 启动并设置开始启动docker

```bash
# 启动& 开机启动docker； enable + start 二合一
systemctl enable docker --now
```

```bash
# 启动docker，但是下次开机还要再次输入命令启动
sudo systemctl start docker
```

### 5. 配置docker源加速

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://registry.dockermirror.com/"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```



# Dokcer命令

## 镜像操作：docker search

搜索镜像

![image-20240821101549311](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859012.png)

- NAME: 镜像的名字

- DESCRIPTION： 镜像的描述

- STARS： star数

- OFFICIAL： 是否是官方发布的

## 镜像操作：docker pull

下载镜像

![image-20240821101947185](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859013.png)

当pull的镜像没有加版本号的时候会使用默认的tag，一般就是latest。

下载指定版本镜像:

![image-20240821102429147](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859015.png)



### 如何查看镜像有哪些版本

进入docker hub： https://hub.docker.com/

搜索nginx：

![image-20240821102949468](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859016.png)

在tag标签中可以看到很多版本

![image-20240821103151918](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859017.png)

## 镜像操作：docker images

完整写法： `docker image ls`

作用：查看已经下载的镜像列表

在查看之前使用 `docker pull nginx`拉了一个最新版本的nginx镜像。

查看镜像列表：

![image-20240821102446802](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859018.png)

- REPOSITORY：镜像的名字

- TAG：镜像的版本

- IMAGE ID：镜像的唯一ID

- CREATED：镜像多少天前创建出来的

- SIZE：镜像的大小

## 镜像操作：docker rmi 

作用：使用`docker rmi [REPOSITORY]` 或者`docker rmi [IMAGE ID]`来删除镜像。

删除nginx:1.26.0镜像:

`docker rmi nginx:1.26.0`

![image-20240821103510620](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859019.png)

使用IMAGE ID删除redis镜像：

`docker rmi dae` 

dae是redis IMAGE ID的前三位, 也可以填完整的，前三位就够了，前提是保证没和其他的重复。

![image-20240821103550646](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859020.png)



再使用`docker images`查看已安装的镜像列表

![image-20240821103820129](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859021.png)



只有nginx:latest镜像了

## 容器操作：docker run

作用：运行容器

`docker run [镜像id或者镜像名字]`

当有了一个镜像后，就可以启动这个镜像中的应用。如果没下载这个镜像，还会先拉取镜像，然后再启动容器。

![image-20240821104809003](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859022.png)

但是会卡住终端进程，可以加参数再后台启动容器

- `-d`： 后台启动

- `--name`： 重命名

```bash
docker run -d --name mynginx nginx
```

现在启动了当前容器的nginx，但是外部是访问不到的，因为容器之间是隔离的，容器与外部也是隔离的，所以在容器中进行**端口映射**。

在docker run的时候加上 ` -p 外部端口:容器内部端口`

```bash
docker run -d --name mynginx -p 88:80 nginx
```

![image-20240821112415061](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859023.png)

代表任何ip访问外部88端口都映射到容器内部的80端口。

如果是云服务器，需要开放88端口。

在浏览器上访问页面，即可看到nginx默认页面了

![image-20240821112527923](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859024.png)

## 容器操作：docker ps

作用：查看正在运行的容器

![image-20240821110823570](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859025.png)

- CONTAINER ID： 运行容器的唯一ID

- IMAGE： 使用哪个镜像运行的

- COMMAND：容器启动命令

- CREATED：多长时间之前启动的

- STATUS：启动状态 UP就代表启动成功了

- PORTS:  占用的端口

- NAMES： 应用容器的名字, 随机的

`docker ps -a `

查看所有的容器，包括已经停止了的。

## 容器操作：docker stop

`docker stop [容器id或者容器名字]`

作用：停止正在运行的容器

![image-20240821110921582](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859026.png)

## 容器操作：docker start

`docker start [容器id或者容器名字]`

启动已停止的容器。

![image-20240821111104024](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859027.png)

## 容器操作：docker restart

`docker restart [容器id或者容器名字]`

重启容器。

![image-20240821111016816](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859028.png)

## 容器操作：docker stats

`docker stats [容器id或者容器名字]`

查看正在运行容器的**实时**的统计信息，像CPU、内存、网络IO。

![image-20240821111336196](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859029.png)

## 容器操作：docker logs

`docker logs [容器id或者容器名字]`

查看容器运行中日志

![image-20240821111458169](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859030.png)

## 容器操作：docker exec

进入容器内部

`-it`是代表以交互的方式进入内部

```bash
docker exec -it [容器id/容器名字] /bin/bash
```

 ![image-20240821114117492](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859031.png)

上图可以看到主机名已经换了，换成了docker容器内的主机名

现在就可以进入到容器内部去操作了：

![image-20240821114237834](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859032.png)

注： `/usr/share/nginx/html` 这个路径要看nginx镜像中的使用说明，而不是瞎猜的。

exit 退出容器。

## 容器操作：docker rm

`docker rm [容器id或者容器名字]`

删除容器

![image-20240821110618283](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859033.png)

查看所有容器，变成空的了。

![image-20240821110644434](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859034.png)

`docker rm -f [容器id]` 强制删除，即使容器在运行中。



### 删除所有容器

使用`docker ps -aq` 可以获取到所有容器的id，然后通过`docker rm $(docker ps -aq)`可以删除所有容器。



## 总结案例

启动一个nginx，并将它的首页改为自己的页面，发布出去，让所有人都使用。

![image-20240821101412763](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859035.png)

# Dokcer存储

docker存储解决了两大问题：

1. 我们能通过`docker exec`进入容器内部，但是连`vim`都不能使用的`docker`容器让我们修改文件变的困难(因为docker要尽可能的精简)，容器内的文件的问题难以管理。docker存储就帮我们解决了这个问题
2. 容器有自己的文件系统，数据也在自己的容器内部，如果容器因为应用崩溃或者被删除了，容器数据就会丢失。docker存储也可以解决这个问题

docker存储有两种方式

1. 目录挂载：

   示例：  `-v /app/nghtml:/usr/share/nginx/html`
2. 卷映射：

   示例：`-v ngconf:/etc/nginx`



## 目录挂载

目录挂载就是将docker容器内部的目录挂载到外部(主机)的指定目录中，二者是同步更新的，也就是说修改容器内部的文件会影响到外部，修改外部的文件也会影响到内部。当主机目录不存在的时候，docker会自动在主机上创建该目录。**目录挂载初始启动的时候目录是空的**。

在`docker run `的时候使用`-v` 选项进行目录挂载。

`docker run -v 主机目录:容器目录`

`docker run -v /app/nghtml:/usr/share/nginx/html`



试一下目录挂载的功能

先启动一个容器

```bash
docker run -d -p 88:80  -v /app/nghtml:/usr/share/nginx/html --name app03 nginx
```

![image-20240821142558774](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859036.png)

发现`/app/nghtml`目录已经被创建好了

此时在浏览器访问88

![image-20240821142741660](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859037.png)

因为没有目录挂载初始启动的时候目录是空的，index.html文件不存在所以403.

创建index.html 并写入一些数据

![image-20240821142930976](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859038.png)

再次访问88端口

![image-20240821143034048](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859039.png)

浏览器上显示的就是我们刚写入的数据。



我们现在**进入容器内**看看目录中文件

![image-20240821143431518](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859040.png)

这里的index.html里面是我们刚才修改的111

修改容器内的index.html

![image-20240821143602696](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859041.png)

再次访问88端口

![image-20240821143637213](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859042.png)

**退出容器进入主机**，查看index.html文件

![image-20240821143726365](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859043.png)

**数据也是被同步了。**

删除容器

![image-20240821144127315](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859044.png)

容器被删除，数据也随之被删除。

但是主机上的数据还是有的，不会因为容器被删除数据也被删除。

![image-20240821144509318](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859045.png)





## 卷映射

官方地址：

卷代表存储，<a href="https://docs.docker.com/engine/storage/volumes/">卷映射</a>也就是存储文件映射

```bash
# 创建卷
docker volume create [my-vol]

# 查看所有卷
docker volume ls

# 移除卷
docker volume rm [my-vol]

# 查看某个卷信息
docker volume inspect [my-vol]

# 删除本地所有数据卷
docker volume prune

# 卷的存储路径，一般都是
# /var/lib/docker/volumes
```

如果我们要将`nginx`容器中`conf`文件映射到外部，就可以使用卷映射的功能

```bash
docker run -d \
  -p 88:80 \
  --name devtest \
  -v /app/nghtml:/usr/share/nginx/html \
  -v ngconf:/etc/nginx \
  nginx
```

也可以使用`--mount`

```bash
#  -v ngconf:/etc/nginx \
# 等同于
 --mount source=ngconf,target=/etc/nginx \
```

查看所有卷，可以看到docker为我们自动创建了`ngconf`卷

![image-20240821172047646](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859046.png)



查看刚刚创建的`ngconf`卷的信息

![image-20240821172148361](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859047.png)

查看该卷对应的`Mountpoint`的路径

![image-20240821172237689](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859048.png)

可以看到这把容器内`/etc/nginx`的文件同步到了docker指定的目录。

编辑`nginx.conf`，添加一行注释代码

![image-20240821173824122](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859049.png)



进入容器内的nginx的配置文件中查看

![image-20240821173900923](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859050.png)

发现也变了，是**同步**的。



如果这个功能我们用目录挂载可以做吗？

是不可以的，因为如果用目录挂载将 容器的配置文件目录和宿主机的目录对应起来，那么在初次启动的时候会以宿主机为主，而目录挂载初次不会同步到宿主机，所以没有nginx.conf, 容器都无法启动。如果非要用目录挂载的话，可以将配置文件从容器中手动复制过来。

## 目录挂载和卷映射的区别

1. **目录挂载初始化启动的时候以宿主机为准**

2. **卷映射初始化启动的时候会把容器内的文件copy一份到宿主机，保持两者一致性**

3. **卷完全由 Docker 管理， docker有命令可以管理卷，假如docker部署了很多应用，随着时间的流逝文档的丢失，如果是卷，我们就可以用docker命令来查看所有的卷信息**

如果使用` -v`的话，当以`/`或`.`开头会识别为一个路径，`docker`会认为这是一个目录挂载，否则会当成一个卷映射来处理。

`-v`语法将所有选项组合在一个字段中，可以使用`--mount`语法将他们分开，可以*更明确、更详细*。

目录挂载：

```bash
# -v的形式
docker run -d \
  -it \
  --name mynginx \
  -v /app/nghtml:/usr/share/nginx/html \
  nginx
  
# --mount的形式
docker run -d \
  -it \
  --name mynginx \
  --mount type=bind,source=/app/nghtml,target=/usr/share/nginx/html \
  nginx
```

卷映射：

```bash
# -v的形式
docker run -d \
  -p 88:80 \
  --name devtest \
  -v ngconf:/etc/nginx \
  nginx
 

# --mount的形式
docker run -d \
  -p 88:80 \
  --name devtest \
   --mount source=ngconf,target=/etc/nginx \
  nginx
```



# Docker 网络

Docker网络的作用：**容器间的互联和通信**

docker会为每个容器分配一个唯一ip，容器A访问容器B，使用容器B的ip+端口就可以互相访问。

我们测试下这个功能：

1. 先启动两个容器

![image-20240822094419271](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859051.png)

2. 查看app02容器的信息

   ![image-20240822094509745](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859052.png)

   往下翻，看到`"Networks"`字段，其中`"IPAddress"`字段就是`docker`给我们分配了的`ip`地址

   ![image-20240822094613612](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859053.png)

   

3. 进入app01容器，然后使用curl访问app02的ip加上容器中的nginx端口

   (容器ip+容器端口)

   ![image-20240822094745717](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859054.png)

成功拿到了对应的信息。

但是`ip`访问的方式具有不稳定性, 容器的IP地址可能会发生变化，Docker网络通过域名进行通信可以让容器间的通信更加稳定可靠，docker0默认不支持主机域名，但是**docker可以允许我们自己创建网络，容器名就是稳定域名**。用docker启动的所有容器网络都是互通的，容器之间可以任意进行访问。只需要容器ip+容器内的应用端口就可以了。



## 创建自定义网络

> 打通容器的可访问性

1. 先把刚才创建的容器都删了，方便后续测试(也可以不删)

![image-20240822095851009](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859055.png)

现在容器列表中是空的了。

2. 需要先创建一个network

![image-20240822100555763](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859056.png)

3. 使用network将容器连接到网络

![image-20240822100946466](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859057.png)

4. 查看app02的信息

   ![image-20240822101025705](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859058.png)

   ![image-20240822101133486](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859059.png)

5. 在app01容器内部使用域名访问app02容器

​	![image-20240822101244419](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408221859060.png)

获取到了数据，可以访问，容器名就是域名。



## 其他命令

```bash
# 列出所有网络
docker network ls
# 查看网络详细信息
docker network inspect my_network
# 创建一个新网络
docker network create my_network
# 删除一个或多个网络
docker network rm my_network
# 将一个容器连接到一个网络
docker network connect my_network my_container
# 将一个容器从一个网络断开
docker network disconnect my_network my_container
```



# 最佳实践

docker容器运行时需要考虑到下面几点

**网络、存储、环境变量**

1. 要考虑容器需不需要暴露端口给外界访问

   - -p 端口映射
   - --network 加入自定义网络

2. 要考虑容器有没有配置文件需要挂载到宿主机修改/有没有数据需要挂载到宿主机进行持久化

   - 目录挂载

   - 卷映射
   - 数据目录怎么挂载需要参照docker hub来进行编写

3. 要考虑容器启动时需不需要传入环境变量做初始配置

   - 参照docker hub来进行编写
4. 要考虑需要安装哪个版本

   - tag

   

根据上面我们的最佳实践我们来启动一个mysql容器

首先要通过docker hub找到mysql

![image-20240822211717499](https://gitee.com/freeanyli/picture/raw/master/image-20240822211717499.png)

然后阅读**overview**。

1. mysql容器需要映射，映射端口为3306

   > -p 3306:3306 

2. mysql容器需要配置文件/数据挂载到宿主机

   > -v /app/myconf:/etc/mysql/conf.d \
   >
   >  -v /app/mydata:/var/lib/mysql \

3. mysql启动时要传入环境变量

   > -e MYSQL_ROOT_PASSWORD=123456 \

4. 需要安装哪个版本

   ![image-20240822213704839](https://gitee.com/freeanyli/picture/raw/master/image-20240822213704839.png)

   在tag标签中可以找到版本，这里安装5.7.40

   > mysql:5.7.40

   通过以上的逻辑梳理，现在写成了一条完整的容器运行命令

   ```bash
   docker run -d -p 3306:3306 \
   > -v /app/myconf:/etc/mysql/conf.d \
   > -v /app/mydata:/var/lib/mysql \
   > -e MYSQL_ROOT_PASSWORD=123456 \
   > mysql:5.7.40
   ```

   通过docker ps -a查看，容器运行成功

   ![image-20240822212544767](https://gitee.com/freeanyli/picture/raw/master/image-20240822212544767.png)

通过docker最佳实践可以帮我们清晰的启动一个容器，这也是快速熟悉docker的方法，学习docker可以把熟悉的镜像下载下载，然后用最佳实践来启动容器。

![image-20240822214216311](https://gitee.com/freeanyli/picture/raw/master/image-20240822214216311.png)



# Docker Compose

> 批量管理容器 （定义和运行多容器的工具）

把要启动的容器都写到`compose.yaml`文件中，使用`docker compose`命令将文件中**指定的所有容器全部批量的启动或停用**。

![image-20240822214737311](https://gitee.com/freeanyli/picture/raw/master/image-20240822214737311.png)

**上线**是第一次启动

**启动**是指停用了，然后重新启动起来。

当我们在部署应用的时候，要安装很多容器，容器安装的命令比较繁琐而且容易出错，直接编写**compose.yaml**文件，直接把要启动的所有文件一次性都放到**yaml**文件中写好，在宿主机中使用**compose**命令一键启动，就算要迁移机器，只要把文件交给对方，对方也可以使用**docker compose** 一键启动。



## 编写compose.yaml

`compose.yaml`文件就是将我们编写的复杂且容易写错的`docker run` 命令通过`compose`规范写成一份`yaml`配置文件。

![image-20240822223246507](https://gitee.com/freeanyli/picture/raw/master/image-20240822223246507.png)

在学习`docker compose`之前先来看下命令式的安装方式

```bash
#创建网络
docker network create blog

#启动mysql
docker run -d -p 3307:3306 \
-e MYSQL_ROOT_PASSWORD=123456 \
-e MYSQL_DATABASE=wordpress \
-v mysql-data:/var/lib/mysql \
-v /app/myconf:/etc/mysql/conf.d \
--restart always --name mysql \
--network blog \
mysql:5.7.40
# --restart always表示开机自动重启

#启动wordpress
docker run -d -p 8080:80 \
-e WORDPRESS_DB_HOST=mysql \
-e WORDPRESS_DB_USER=root \
-e WORDPRESS_DB_PASSWORD=123456 \
-e WORDPRESS_DB_NAME=wordpress \
-v wordpress:/var/www/html \
--restart always --name wordpress-app \
--network blog \
wordpress:latest
```

我们先把刚才安装的网络和容器都清理下:

![image-20240823141931172](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231419381.png)

创建网络：

![image-20240823142048662](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231731328.png)

创建mysql容器：

![image-20240823142806703](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231428818.png)

使用`docker ps -a`看到已经创建成功了:

![image-20240823142818333](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231428456.png)

在外部测试下mysql是否启动成功：

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231434851.png" alt="image-20240823143446766" style="zoom:50%;" />



启动wordpress容器

![image-20240823150449895](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231504146.png)

查看正在启动的容器：

![image-20240823150610623](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231506760.png)

访问下8080端口

![image-20240823150732005](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231507095.png)

命令式安装我们已经完成了，可以发现**命令式安装需要记很多繁琐的命令，而且不易维护。**



现在我们将将命令式安装转换成compose.yaml文件

```bash
name: myblog
services:
  mysql: # 应用名 其实就是容器名
    container_name: mysql # 对应-- name 容器名(优先级更高)
    image: mysql:5.7.40			# 对应镜像
    ports:
      - "3307:3306" # 端口
    environment: # 环境变量数组的写法
      - MYSQL_ROOT_PASSWORD=123456
      - MYSQL_DATABASE=wordpress
    volumes: # 卷映射和目录挂载
      - mysql-data:/var/lib/mysql
      - /app/myconf:/etc/mysql/conf.d
    restart: always # 开机自启
    networks:
      - blog

  wordpress:
    image: wordpress
    ports:
      - "8080:80"
    environment: # 环境变量kv的写法
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: 123456
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress:/var/www/html
    restart: always
    networks:
      - blog
    depends_on: # 决定了启动顺序， 依赖谁
      - mysql


volumes: # 使用卷映射需要声明一下，在这里可以配置卷的详细信息
  mysql-data:
  wordpress:

networks: # 使用了需要声明一下，在这里可以配置网络的详细信息
  blog:
```

使用`docker compose`指定yaml一键运行多容器: 

**`docker compose -f compose.yaml up -d`**

`-f compose.yaml`可以不写，默认就是`compose.yaml`。

![image-20240823152233550](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231522684.png)

可以看到是和我们命令式的结果一样的

![image-20240823152253765](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231522904.png)



## docker compose注意事项

当修改了`yaml`文件时，使用`docker compose -f compose.yaml up -d`重新执行yaml文件，`docker`会进行增量更新。

即修改 `Docker Compose` 文件。重新启动应用。只会触发修改项的重新启动。

`docker`默认就算`down`了容器，所有挂载的卷不会被移除。比较安全。

# Dockerfile

`Dockerfile`的作用可以把自己的软件制作成一个镜像。`docker`会通过`Dockerfile`中的指令自动构建成一个自定义镜像。

编写`Dockerfile`就是编写一堆的指令

https://docs.docker.com/reference/dockerfile/

![image-20240823143936781](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231439913.png)



## 编写Dockerfile

> COPY <src> <dest> :  复制本地主机的 <src>下内容到镜像中的 <dest>，目标路径不存在时，会自动创建。

```bash
FROM openjdk:17

LABEL author=hrgg

COPY app.jar /app.jar

EXPOSE 8081

ENTRYPOINT ["java","-jar","/app.jar"]
```



## 构建镜像

```bash
docker build -f Dockerfile -t myjavaapp:v1.0 .
# -t 表示 --tag 
# .表示运行当前命令的上下文目录
```

![image-20240823154306336](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231543577.png)

构建完成

![image-20240823165351232](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231653554.png)

看一下现在images镜像列表

![image-20240823165414855](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231654011.png)

根据刚创建的镜像启动容器

![image-20240823172547687](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231725790.png)

访问8080端口

![image-20240823172636666](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231726749.png)

响应正确，是我们在java代码中返回的数据。我们完成了通过Dockerfile创建镜像，启动容器的整个流程。

# Docker的镜像分层存储机制

docker在底层存储一个镜像是分层存储的，这些层产生于Dockerfile文件，当用Dockerfile构建一个镜像的时候，每一行指令都有可能产生修改文件系统或者下载了文件。这么就会产生一个存储层。

假如有两个应用，这两个应用的环境都是openjdk17，分层存储的好处就是这两个镜像会共用底层的部分，这两个镜像只要存储增量的部分。

![image-20240823145431976](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231454001.png)



# 总结

![image-20240823161727490](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/202408231617664.png)
