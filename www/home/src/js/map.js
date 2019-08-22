;(function(){

    function MyMap(data){
        // 足迹数据
        this.data = data;
        // 标志数据
        this.markers = [];
        // 初始化
        this.init();
    }
    
    MyMap.prototype = {
        /**创建 */
        init: function(){
            let contx = this;
    
            // 组件初始化
            mapboxgl.accessToken = 'pk.eyJ1IjoidGxiaW4iLCJhIjoiY2p3dnBjeXB5MDNvYzQ5cGR1aHo3NjJ6bCJ9.6sM04lknQ_UAGOww8veJ7g';
            let M = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/light-v9',
                center: [108.14, 33.87],
                cluster: !0,
                minZoom: 1,
                maxZoom: 10,
                zoom: 3
            });
            mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js');
            M.addControl(new MapboxLanguage({
                defaultLanguage: 'zh'
            }));
            M.addControl(new mapboxgl.NavigationControl({
                showCompass: !1
            }));
    
            //事件处理
            M.on('load', ()=>{
                contx.cluster.load(contx.data.features);
                contx.clusterData = {
                    features: contx.cluster.getClusters([-180, -90, 180, 90], 3)
                };
                contx.updateMarkers();
            }),
            M.on('zoom', ()=>{
                let zoom = Math.floor(contx.Map.getZoom());
                contx.clusterData = {
                    features: contx.cluster.getClusters([-180, -90, 180, 90], zoom)
                },
                contx.updateMarkers();
            }),
    
            // 状态保存到对象
            this.cluster = new Supercluster({
                radius: 26,
                maxZoom: 10
            }),
            this.Map = M;
        },
    
        /**更新标志 */
        updateMarkers: function(){
            this.markers.forEach( (t)=>{
                return t.remove()
            });
            for(let i=0, item; item=this.clusterData.features[i]; i++){
                item.properties.cluster ? this.addClusterMarker(item) : this.addPhotoMarker(item);
            }
        },
    
        /**创建标志节点元素 */
        createMarker: function(){
            return document.createElement('div');
        },
    
        /**添加单标志【未合并的标志】 */
        addPhotoMarker: function(data){
            let div = this.createMarker(), popStr;
            if(data.properties.link){
                div.className = 'marker';
                popStr = '<a target="_blank" href="/' +data.properties.link+ '.html"><h6>' +data.properties.title+ '</h6><img src="https://qiniu.tlbin.com/image/' +data.properties.image+ '"></a>';
            }else{
                div.className = 'marker nolink';
                popStr = '<h6>' +data.properties.title+ '</h6><p>该地点暂无对应相册</p>';
            }
            let marker = new mapboxgl.Marker(div).setLngLat(data.geometry.coordinates).setPopup(new mapboxgl.Popup({
                offset: 25
            }).setHTML(popStr)).addTo(this.Map);
            this.markers.push(marker);
        },
    
        /**添加合并标志 */
        addClusterMarker: function(data){
            let contx = this,
                div = this.createMarker();
            div.className = 'marker cluster',
            div.addEventListener('click', ()=>{
                let n = {
                    type: 'FeatureCollection',
                    features: contx.cluster.getLeaves(data.properties.cluster_id)
                };
                contx.Map.fitBounds(geojsonExtent(n), {
                    padding: .32 * contx.Map.getContainer().offsetHeight
                })
            }),
            div.dataset.cardinality = data.properties.point_count;
            let marker = new mapboxgl.Marker(div).setLngLat(data.geometry.coordinates).addTo(contx.Map);
            contx.markers.push(marker);
        }
    }
    
    /**初始化 */
    function init(data){
        $('#count').text(data.features.length);
        new MyMap(data);
    }

    /**服务端获取足迹数据 */
    function getData(){
        fetch('api/getjson').then((t)=>{
            return t.json().then((result)=>{
                let data = {
                    type: 'FeatureCollection',
                    features: []
                };
                result.data.forEach(item=>{
                    data.features.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [+item.lng, +item.lat]
                        },
                        properties: {
                            title: item.name, 
                            image: item.img,
                            link: item.link,
                            type: 'visitedWithPost'
                        }
                    });
                });
                // 数据缓存到本地
                localStorage.setItem(cacheKey, JSON.stringify({
                    t: +new Date(),
                    d: data
                }))
                init(data);
            })
        })
    }
    
    /**获取足迹数据 */
    let cacheKey = btoa('footprintlist');
    let cacheData = JSON.parse(localStorage.getItem(cacheKey));
    if(cacheData){
        // 数据已过期
        if(+new Date() - cacheData.t  >= 24*60*60*1000){
            return localStorage.removeItem(cacheKey), getData();
        }
        return init(cacheData.d);
    }
    getData();
})();