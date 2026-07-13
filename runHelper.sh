subModuleList=(choerodon-ui hzero-ui hzero-front srm-front-boot hzero-front-hmde srm-front-cuz srm-front-cuz-config hzero-front-hadm hzero-front-hfile hzero-front-himp hzero-front-hitf hzero-front-hmnt hzero-front-hmsg hzero-front-hpfm hzero-front-hrpt hzero-front-hsdr srm-front-hiam srm-front-mobile srm-front-sads srm-front-sagm srm-front-sbud srm-front-scec srm-front-sdps srm-front-seci srm-front-sfin srm-front-siec srm-front-sigl srm-front-sinv srm-front-sitf srm-front-slod srm-front-small srm-front-smdm srm-front-smep srm-front-smkt srm-front-smodr srm-front-smop srm-front-smpc srm-front-sodr srm-front-spay srm-front-spcm srm-front-spct srm-front-spfm srm-front-sprm srm-front-sqam srm-front-srpm srm-front-sslm srm-front-ssrc srm-front-ssta srm-front-swfl srm-front-cux-twnf)

workSpace=$(pwd)
cd $workSpace

# 编译
compile(){
    for i in ${subModuleList[@]}
    do
    echo ${i}
    cd $workSpace/packages/${i}
    yarn run transpile
    done
    cd $workSpace
}

compile
yarn build:dll
yarn build:all
