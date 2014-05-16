proc pb2 {E Area L P} {

  wipe;
  model basic -ndm 2 -ndf 2

  set A 1
  set B 2
  set C 3
  set D 4

  node $A 0.0 0.0
  node $B [expr -$L] 0.0
  node $C [expr -$L/2.0] [expr sqrt(3)*$L/2.0]
  node $D [expr $L/2.0] [expr sqrt(3)*$L/2.0]

  uniaxialMaterial Elastic 1 $E

  element truss 1 $A $B $Area 1
  element truss 2 $A $C $Area 1
  element truss 3 $A $D [expr 2*$Area] 1

  fix $B 1 1
  fix $C 1 1
  fix $D 1 1

  timeSeries Constant 1
  pattern Plain 1 1 {
    load $A $P 0.0
  }

  constraints Plain
  integrator LoadControl 1
  test NormUnbalance 1.0e-6 30
  algorithm Linear
  numberer Plain
  system BandGeneral
  analysis Static

  analyze 1

  set T1 [eleResponse 1 axialForce]
  set T2 [eleResponse 2 axialForce]
  set T3 [eleResponse 3 axialForce]
  set uA [nodeDisp $A 1]
  set vA [nodeDisp $A 2]

  # convert units:
  set T1 [expr $T1/1000]
  set T2 [expr $T2/1000]
  set T3 [expr $T3/1000]
  set uA [expr $uA*100]
  set vA [expr $vA*100]

  set res [list $T1 $T2 $T3 $uA $vA]
  return $res
}


set E [expr 200e9]
set A [expr 2e-4]
set L [expr 0.25]
set P [expr 50e3]

set res [pb2 $E $A $L $P]

foreach name {T1 T2 T3 uA vA}\
    unit {kN kN kN cm cm} val $res {
      set val [format "%.6f" $val]
      puts "${name} ($unit) = $val"
    }
